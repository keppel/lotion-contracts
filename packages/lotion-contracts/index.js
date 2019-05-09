let { Host } = require('contract-vm')
let coins = require('coins')
let makeBindings = require('./lib/bindings.js')

module.exports = function coinsHandler(opts = {}) {
  return {
    initialState: {
      gasPrice: 1,
      contracts: {},
      contractAPI: {}
    },
    initialize() {},
    onBlock(state, context) {
      let host = new Host({})
      Object.keys(state.contracts).forEach(address => {
        try {
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
          if (context.getAccount(address).balance < 10) {
            return
          }
          if (!host.contracts[address].methodNames.includes('onBlock')) {
            return
          }

          host.currentCallerAddress = address
          host.contracts[address].exports.onBlock()
          state.contracts = host.save()
        } catch (e) {
          console.log('Error in onBlock for ' + address + ':')
          console.log(e)
        }
      })
    },
    onOutput(output, state, context) {
      let host = new Host({})

      /**
       * Load saved host state from lotion store
       */
      let senderPubKey = context.transaction.from[0].pubkey
      let senderAddress = coins.addressHash(senderPubKey)
      host.consumeGas = function(gas) {
        context.burn(senderAddress, gas)
      }
      host.setBindings(makeBindings(state, context, output, host))
      host.load(state.contracts)

      if (output.action === 'create') {
        let contractAddress = host.addContract(output.code, null)
        context.mint({
          address: contractAddress,
          amount: output.amount
        })
        state.contracts = host.save()
      } else if (output.action === 'message') {
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
