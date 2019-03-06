import 'allocator/arena'
export { memory }

export class Contract {
  public count: i32 = 0

  constructor() {}

  increment(value: i32): i32 {
    this.count += value
    return this.count
  }
}
