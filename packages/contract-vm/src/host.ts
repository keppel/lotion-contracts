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

  addContract(code: string): string {
    let contract = new Contract(code, {}, this)

    this.contracts[contract.address] = contract
    return contract.address
  }

  /**
   * save() returns a minimal view of the contracts.
   * You can serialize this view, send it to another machine,
   * and pass it to load() to recreate the same host.
   *
   */
  // save() {
  //   let result: SavedView = {}
  //   Object.keys(this.contracts).forEach(address => {
  //     let memory = Buffer.from(this.contracts[address].memory.slice())
  //     result[address] = {
  //       memory,
  //       code: this.contracts[address].code
  //     }
  //   })
  //   return result
  // }

  // load(view: SavedView) {
  //   Object.keys(view).forEach(address => {
  //     this.contracts[address] = new Contract(
  //       view[address].code,
  //       makeBindings(this, address)
  //     )
  //     this.contracts[address].loadMemory(view[address].memory)
  //   })
  // }
}
