/**
 * This contract just calls methods on `counter.ts` and returns the result.
 */

import 'allocator/arena'

import { contract } from '../../../contract-lib/lib'

export class Contract {
  constructor() {}
  addToCount(n: i32 = 0): i32 {
    let count: i32 = contract.call<i32, i32>(
      'HuBMN6L8FjtSnLOARQd/rwLrlVPoB+/PJvSV810Pe+0=',
      'increment',
      n
    )
    return count
  }
}
