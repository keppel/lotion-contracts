/**
 * The Host facilitates interaction between contract instances.
 *
 * This class is used from Web8 and Lotion. The ContractStore is pluggable;
 * you may lazily initialize contracts by fetching contract code as a light client,
 * as in the case of Web8. Or, in the case of cross-chain contract interaction,
 * the Contract instances returned by the provided ContractStore may do IBC stuff.
 */

import { Contract } from './contract'
import { makeBindings } from './bindings'
let { stringify, parse } = require('deterministic-json')

interface Message {
  sender: string
  to: string
  method: string
  data?: any
}

interface HostOptions {
  bindings?: object
}

type GasMeter = (cost: number) => void
interface ContractMap {
  [index: string]: Contract
}
interface SavedView {
  [index: string]: {
    code: string
    state: any
  }
}

export class Host {
  public contracts: ContractMap = {}
  public consumeGas: GasMeter | null = null

  public makeBindings: any

  constructor(options: HostOptions = {}) {
    this.makeBindings = makeBindings.bind(this, this)
  }

  execute(message: Message, consumeGas?: GasMeter) {
    if (consumeGas) {
      this.consumeGas = consumeGas
    }
    let contract: Contract = this.contracts[message.to]
    if (typeof contract.exports[message.method] !== 'function') {
      throw new Error('Contract has no method called ' + message.method)
    }

    let result = contract.exports[message.method](...message.data)
    return result
  }

  addContract(code: string, state: any = {}): string {
    let contract = new Contract(code, state, this)

    this.contracts[contract.address] = contract
    return contract.address
  }

  /**
   * save() returns a minimal view of the contracts.
   * You can serialize this view, send it to another machine,
   * and pass it to load() to recreate the same host.
   *
   */
  save() {
    let result: SavedView = {}
    Object.keys(this.contracts).forEach(address => {
      result[address] = {
        code: this.contracts[address].code,
        state: parse(stringify(this.contracts[address].state))
      }
    })
    return result
  }

  load(view: SavedView) {
    this.contracts = {}
    Object.keys(view).forEach(address => {
      this.addContract(view[address].code, view[address].state)
    })
  }
}
