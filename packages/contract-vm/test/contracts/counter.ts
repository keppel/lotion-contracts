import 'allocator/arena'
export { memory }

import { contract } from '../../../contract-lib/lib'

export class Contract {
  public count: i32 = 0

  constructor() {}

  increment(n: i32): i32 {
    this.count += n
    return this.count
  }
}
