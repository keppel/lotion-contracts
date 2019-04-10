let coins = require('coins')

module.exports = function(state, context, info, host) {
  let address = info.to

  return {
    Bitcoin: {
      send(to, amount) {
        context.burn(address, amount)
        context.mint({ address: to, amount })
      },
      getBalance() {
        return context.getAccount(address).balance
      }
    },

    Contract: {
      getAddress() {
        return address
      },
      getTransaction() {
        if (context.transaction) {
          return {
            senderAddress: coins.addressHash(
              context.transaction.from[0].pubkey
            ),
            amount: info.amount
          }
        } else {
          /**
           * onBlock initiated this
           */
          return {
            senderAddress: info.senderAddress,
            amount: 0
          }
        }
      },
      wrap(targetAddress) {
        let target = host.contracts[targetAddress]
        if (target) {
          return target.exports
        } else {
          throw new Error(
            'Target contract does not exist at address ' + targetAddress
          )
        }
      }
    }
  }
}
