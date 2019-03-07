//prettier-ignore
@external('contract', '_call')
declare function _call<Input, Output>(address: string,
  method: string,
  arg: Input, argType: string, returnType: string): Output

export namespace contract {
  function call<Input, Output>(
    address: string,
    method: string,
    arg: Input
  ): Output {
    let argType: string = 'void'
    if (isString<Input>(arg)) {
      argType = 'string'
    } else if (isArray<Input>(arg)) {
      argType = 'array'
    }

    let returnType: string = 'void'
    if (isString<Output>()) {
      returnType = 'string'
    } else if (isArray<Output>()) {
      returnType = 'array'
    }
    return _call<Input, Output>(address, method, arg, argType, returnType)
  }
}
