/**
 * This contract just calls methods on `counter.ts` and returns the result.
 */

import 'allocator/arena'

//prettier-ignore
@external('contract', 'call')
declare function _call<I, O>(address: string, method: string, arg: I, thing: bool ): O;

export class Contract {
  constructor() {}
  addTen(): i32 {
    let n: i32 = 10

    return n
  }
}
