let { Host } = require('contract-vm')
let coins = require('coins')

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
        host = new Host()
      }
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
        }
      }
    }
  }
}
