let fs = require('fs')
let metering = require('wasm-metering')
let loader = require('assemblyscript/lib/loader')
let { createHash } = require('crypto')
let muta = require('muta')
let debug = require('debug')('contract')
let coins = require('coins')

class VM {
  constructor(stateRef, context) {
    /**
     * Contract storage and account balances.
     * Indexed by contract address
     */

    this.contracts = {}
    this.stateRef = stateRef
    this.context = context
    this.gasBills = {}

    /**
     * Reinitialize any existing contracts on the state.
     */
    Object.values(this.stateRef.binaries).forEach(bin => {
      this.createContract(bin)
    })
  }

  createContract(wasm, amount) {
    function buildImports(contractAddress) {
      return {
        metering: {
          usegas: gas => {
            try {
              this.gasBills[contractAddress] += gas
              if (this.gasBills[contractAddress] >= 100000)
                this.context.burn(
                  contractAddress,
                  Math.ceil(
                    this.gasBills[contractAddress] * this.stateRef.gasPrice
                  )
                )
              this.gasBills[contractAddress] = 0
            } catch (e) {
              throw 'gas'
            }
          }
        },
        contract: {
          _setItem: (key, value, valueTypePtr) => {
            try {
              let contract = this.contracts[contractAddress]
              key = contract.getString(key)
              let valueType = contract.getString(valueTypePtr)
              if (['string', 'u64', 'i64'].indexOf(valueType) !== -1) {
                value = contract.getString(value)
              }

              this.storage[contractAddress][key] = value
            } catch (e) {
              debug(e)
            }
          },
          _getItem: (key, valueTypePtr) => {
            try {
              let contract = this.contracts[contractAddress]
              key = contract.getString(key)
              let valueType = contract.getString(valueTypePtr)
              if (['string', 'u64', 'i64'].indexOf(valueType) !== -1) {
                let strPtr = contract.newString(
                  this.storage[contractAddress][key]
                )
                return strPtr
              } else {
                return this.storage[contractAddress][key]
              }
            } catch (e) {
              debug('error in _getValue:')
              debug(e)
            }
          },
          _log: msgPtr => {
            let msg = this.contracts[contractAddress].getString(msgPtr)
            debug(`<${contractAddress}>: ` + msg)
          },
          _getAddress: () => {
            return contractAddress
          },
          _getBalance: () => {
            let ptr = this.contracts[contractAddress].newString(
              '' + this.getBalance(contractAddress)
            )
            return ptr
          },
          _sendFunds: (address, amount) => {
            try {
              let contract = this.contracts[contractAddress]
              amount = Number(contract.getString(amount))
              address = this.contracts[contractAddress].getString(address)

              this.context.burn(contractAddress, amount)
              this.context.mint({ address, amount })
            } catch (e) {
              debug('error in _sendFunds:')
              debug(e)
            }
          },
          _getTransactionAmount: () => {
            /**
             * If contract is handling a transaction,
             * get the amount of value being transferred
             * to this contract by the transaction.
             */
            let amount
            if (!this.currentTransaction) {
              amount = 0
            } else {
              amount = this.currentTransaction.amount
            }
            let ptr = this.contracts[contractAddress].newString('' + amount)
            return ptr
          },
          _getTransactionSender: () => {
            let senderPubKey = this.context.transaction.from[0].pubkey
            let senderAddress = coins.addressHash(senderPubKey)
            let ptr = this.contracts[contractAddress].newString(
              '' + senderAddress
            )
            return ptr
          }
        }
      }
    }

    this.currentTransaction = null

    let meteredWasm = metering.meterWASM(wasm, {})

    // Compute contract address
    let contractAddress = createHash('sha256')
      .update(wasm)
      .digest('base64')

    this.gasBills[contractAddress] = 0
    // Make sure the contract doesn't already exist
    if (!this.stateRef.storage[contractAddress]) {
      // Initialize storage and balance
      this.stateRef.storage[contractAddress] = {}
    }
    if (amount) {
      this.context.mint({ address: contractAddress, amount })
    }

    let compiled = new WebAssembly.Module(meteredWasm, {})
    this.stateRef.binaries[contractAddress] = wasm

    this.contracts[contractAddress] = loader.instantiate(
      compiled,
      buildImports.call(this, contractAddress)
    )

    this.storage = muta(this.stateRef.storage)
    if (
      this.contracts[contractAddress].init &&
      !this.stateRef.storage[contractAddress]
    ) {
      try {
        this.contracts[contractAddress].init()
        muta.commit(this.storage)
      } catch (e) {
        debug('error in init method:')
        debug(e)
      }
    }

    return contractAddress
  }

  onBlock() {
    this.currentTransaction = null
    Object.keys(this.contracts).forEach(contractAddress => {
      let contract = this.contracts[contractAddress]
      if (contract.onBlock) {
        try {
          this.storage = muta(this.stateRef.storage)
          contract.onBlock()
          muta.commit(this.storage)
        } catch (e) {
          if (e === 'gas') {
            this.removeContract(contractAddress)
          }
          throw e
        }
      }
    })
  }

  getBalance(address) {
    try {
      return this.context.getAccount(address).balance
    } catch (e) {
      return 0
    }
  }

  removeContract(address) {
    delete this.storage[address]
    delete this.contracts[address]
    delete this.stateRef.binaries[address]
  }

  exec(message) {
    let { address, data, method, amount } = message
    this.currentTransaction = { address, data, method, amount }
    if (!this.contracts[address]) {
      throw new Error('Contract does not exist at address ' + address)
    }

    if (!data) {
      data = []
    }
    if (!(data instanceof Array)) {
      throw new Error('output.data must be an array')
    }

    this.storage = muta(this.stateRef.storage)
    try {
      let result = this.contracts[address][method](...data)
      muta.commit(this.storage)
      return result
    } catch (e) {
      /**
       * If there's an error at any point during execution,
       * storage mutations shan't be applied.
       */

      throw e
    }
  }
}

module.exports = VM
