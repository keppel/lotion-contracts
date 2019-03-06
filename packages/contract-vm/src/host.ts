/**
 * The Host facilitates interaction between contract instances.
 *
 * This class is used from Web8 and Lotion. The ContractStore is pluggable;
 * you may lazily initialize contracts by fetching contract code as a light client,
 * as in the case of Web8. Or, in the case of cross-chain contract interaction Lotion,
 * the Contract instances returned by the provided ContractStore may do IBC stuff.
 */

import { Contract } from './contract'
import { ContractStore } from './contract-store'

interface HostOptions {
  contractStore?: ContractStore
  meter?(gas: number)
}

interface Message {
  sender: string
  to: string
  method: string
  data?: Array<any>
}

type GasMeter = (cost: number) => void

export class Host {
  public contractStore: ContractStore

  constructor(opts: HostOptions) {
    if (opts.contractStore) {
      this.contractStore = opts.contractStore
    } else {
      this.contractStore = new ContractStore()
    }
  }

  execute(message: Message, consumeGas?: GasMeter) {
    let wrappedContract = this.contractStore.getContract(message.to)
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
}
