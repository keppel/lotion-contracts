/**
 * This contract just calls methods on `counter.ts` and returns the result.
 */

import 'allocator/arena'

//prettier-ignore
@external('contract', 'call')
declare function call(address: string, method: string, n: i32): i32;

export class Contract {
  constructor() {}
  addTen(): i32 {
    let currentCount: i32 = call(
      'PSgD7Oz4ViOZ+FZMN1/KLXDj60EphsUTlC3B2iMmhlk=',
      'increment',
      10
    )
    return currentCount
  }
}
