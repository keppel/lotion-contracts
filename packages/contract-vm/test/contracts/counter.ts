import 'allocator/arena'
export { memory }

//prettier-ignore
@external('contract', 'call')
declare function call(address: string, method: string, a: i32, b: i32): void;

export class Contract {
  public count: i32 = 0

  constructor() {}

  increment(value: i32): i32 {
    this.count += value
    return this.count
  }
}
