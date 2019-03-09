export function makeBindings(host, address) {
  return {
    contract: {
      ...host.bindings,
      _call: (addressPtr, methodPtr, arg, argTypePtr, returnTypePtr) => {
        let caller = host.contracts[address]
        let targetAddress = caller.instance.getString(addressPtr)
        let method = caller.instance.getString(methodPtr)
        let target = host.contracts[targetAddress]
        let argType = caller.instance.getString(argTypePtr)
        let returnType = caller.instance.getString(returnTypePtr)

        if (argType === 'string') {
          arg = caller.instance.getString(arg)
        } else if (argType === 'array') {
          arg = caller.instance.getArray(arg)
        }

        let result = target.contract[method](arg)

        if (returnType === 'string') {
          result = target.instance.getString(result)
        } else if (returnType === 'array') {
          result = target.instance.getArray(result)
        }

        return result
      }
    }
  }
}