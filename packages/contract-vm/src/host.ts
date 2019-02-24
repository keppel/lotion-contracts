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
}

export class Host {
  private contractStore: ContractStore

  constructor(opts: HostOptions) {
    if (opts.contractStore) {
      this.contractStore = opts.contractStore
    } else {
      this.contractStore = new ContractStore()
    }
  }
}
