let { Host } = require('contract-vm')
let coins = require('coins')
let { parse, stringify } = require('deterministic-json')
let makeBindings = require('./lib/bindings.js')

module.exports = function coinsHandler(opts = {}) {
  // Initialize contract VM
  let host

  return {
    initialState: {
      gasPrice: 1,
      contracts: {}
    },
    initialize() {
      if (!host) {
        host = new Host({})
      }
    },
    onBlock(state, context) {
      if (!host) {
        host = new Host({})
      }

      Object.keys(host.contracts).forEach(address => {
        host.setBindings(
          makeBindings(
            state,
            context,
            { to: address, senderAddress: address },
            host
          )
        )
        host.consumeGas = function(gas) {
          context.burn(address, gas)
        }
        host.load(state.contracts)
        try {
          if (typeof host.contracts[address].exports.onBlock !== 'function') {
            return
          }
          if (context.getAccount(address).balance < 10) {
            return
          }
          host.contracts[address].exports.onBlock()
          state.contracts = host.save()
        } catch (e) {
          console.log('Error in onBlock for ' + address + ':')
          console.log(e)
        }
      })
    },
    onOutput(output, state, context) {
      if (!host) {
        host = new Host()
        host.load(state.contracts)
      }
      if (output.action === 'create') {
        let contractAddress = host.addContract(output.code, {})
        context.mint({ address: contractAddress, amount: output.amount })
        state.contracts = host.save()
      } else if (output.action === 'message') {
        let senderPubKey = context.transaction.from[0].pubkey
        let senderAddress = coins.addressHash(senderPubKey)

        /**
         * Load saved host state from lotion store
         */
        host.setBindings(makeBindings(state, context, output, host))
        host.load(state.contracts)
        try {
          host.execute(
            {
              to: output.to,
              data: output.data,
              sender: senderAddress,
              method: output.method
            },
            function(gas) {
              context.burn(senderAddress, gas)
            }
          )
          /**
           * Persist host state to lotion state if execution succeeded
           */
          state.contracts = host.save()
        } catch (e) {
          /**
           * Error is caught and ignored here because we want to consume gas
           * even if the message causes an error.
           */
          console.log('caught error:')
          console.log(e)
        }
      }
    }
  }
}
