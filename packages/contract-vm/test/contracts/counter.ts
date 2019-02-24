import 'allocator/arena'
export { memory }

// prettier-ignore
@external('contract', 'foo')
declare function foo(): void

export class Contract {
  public count: i32 = 0

  constructor() {}

  increment(value: i32): i32 {
    this.count += value
    foo()
    return this.count
  }
}
