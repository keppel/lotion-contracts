import 'allocator/arena'
export { memory }

export class Contract {
  public greeting: ' world'

  constructor() {}

  greet(subject: string): string {
    return 'hello ' + subject
  }
}
