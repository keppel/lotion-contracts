/**
 * Default contract store which uses a plain JavaScript object interface
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
}
