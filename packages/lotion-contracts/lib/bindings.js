let coins = require('coins')
let SES = require('ses')

module.exports = function(state, context, info, host) {
  let s = SES.makeSESRootRealm()

  function makeEndowments() {
    let address = info.to

    function protect(host, contractExports) {
      return new Proxy(contractExports, {
        get(target, prop) {
          if (typeof target[prop] === 'function') {
            return function(...args) {
              return JSON.parse(
                JSON.stringify(
                  target[prop].apply(target, JSON.parse(JSON.stringify(args)))
                )
              )
            }
          } else {
            return JSON.parse(JSON.stringify(target[prop]))
          }
        },
        set(target, prop, value) {
          throw new Error('Wrapped contracts are readonly')
        },
        deleteProperty(target, prop) {
          throw new Error('Wrapped contracts are readonly')
        },
        setPrototypeOf(target, prop) {
          throw new Error('Wrapped contracts are readonly')
        },
        defineProperty(target, prop) {
          throw new Error('Wrapped contracts are readonly')
        },
        preventExtensions(target) {
          throw new Error('Wrapped contracts are readonly')
        }
      })
    }

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
            return protect(host, target.exports)
          } else {
            throw new Error(
              'Target contract does not exist at address ' + targetAddress
            )
          }
        }
      }
    }
  }

  let safeMakeEndowments = s.evaluate(`(${makeEndowments})`, {
    context,
    info,
    host
  })
  return safeMakeEndowments()
}
