//prettier-ignore
@external('contract', '_call')
declare function _call<Input, Output>(address: string,
  method: string,
  arg: Input): Output

export namespace contract {
  function call<Input, Output>(
    address: string,
    method: string,
    arg: Input
  ): Output {
    return _call<Input, Output>(address, method, arg)
  }
}
