/**
 * The Host facilitates interaction between contract instances.
 *
 * This class is used from Web8 and Lotion. The ContractStore is pluggable;
 * you may lazily initialize contracts by fetching contract code as a light client,
 * as in the case of Web8. Or, in the case of cross-chain contract interaction Lotion,
 * the Contract instances returned by the provided ContractStore may do IBC stuff.
 */

import { Contract } from './contract'
let { createHash } = require('crypto')
let loader = require('assemblyscript/lib/loader')

interface Message {
  sender: string
  to: string
  method: string
  data?: Array<any>
}

interface HostOptions {
  bindings?: object
}

type GasMeter = (cost: number) => void

export class Host {
  public contracts = {}

  private bindings

  constructor(options: HostOptions = {}) {
    this.bindings = options.bindings || {}
  }

  execute(message: Message, consumeGas?: GasMeter) {
    let wrappedContract = this.contracts[message.to]
    let { contract } = wrappedContract
    if (typeof contract[message.method] !== 'function') {
      throw new Error('Contract has no method called ' + message.method)
    }
    try {
      wrappedContract.useMeter(consumeGas)
      let result = contract[message.method](...message.data)
      return result
    } catch (e) {
      throw e
    } finally {
      wrappedContract.useMeter()
    }
  }

  addContract(code: Buffer): string {
    let address = createHash('sha256')
      .update(code)
      .digest('base64')

    let contract = new Contract(code, this.makeBindings(address))

    this.contracts[address] = contract
    return address
  }

  /**
   * save() returns a minimal view of the contracts.
   * You can serialize this view, send it to another machine,
   * and pass it to load() to recreate the same host.
   *
   */
  save() {
    let result = {}
    Object.keys(this.contracts).forEach(address => {
      let memory = Buffer.from(this.contracts[address].memory.slice())
      result[address] = {
        memory,
        code: this.contracts[address].code
      }
    })
    return result
  }

  load(view) {
    Object.keys(view).forEach(address => {
      this.contracts[address] = new Contract(
        view[address].code,
        this.makeBindings(address)
      )
      this.contracts[address].loadMemory(view[address].memory)
    })
  }

  private makeBindings(address) {
    return {
      contract: {
        ...this.bindings,
        call: (addressPtr, methodPtr, ...args) => {
          let caller = this.contracts[address]
          let targetAddress = caller.instance.getString(addressPtr)
          let method = caller.instance.getString(methodPtr)
          let target = this.contracts[targetAddress]
          return target.contract[method](...args)
        }
      }
    }
  }
}
