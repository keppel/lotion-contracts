/**
 * Default contract store
 */

import { Contract } from './contract'
let { createHash } = require('crypto')

export class ContractStore {
  constructor(private contracts = {}) {}
  getContract(address: string): Contract {
    if (this.contracts[address]) {
      return this.contracts[address]
    } else {
      throw new Error('Contract does not exist at address ' + address)
    }
  }

  addContract(contract: Contract): string {
    let address = createHash('sha256')
      .update(contract.code)
      .digest('base64')

    this.contracts[address] = contract
    return address
  }

  /**
   * Returns a minimal view of the contracts.
   * You can serialize this view, send it to another machine,
   * and pass it to load() to recreate the same host.
   *
   */
  save() {
    let result = {}
    Object.keys(this.contracts).forEach(address => {
      result[address] = {
        memory: new Uint32Array(this.contracts[address].memory),
        code: this.contracts[address].code
      }
    })
    return result
  }

  load(view) {
    Object.keys(view).forEach(address => {
      this.contracts[address] = new Contract(view[address].code)
      this.contracts[address].loadMemory(view[address].memory)
    })
  }
}
