# Contract VM

This is an implementation of a minimalist smart contract system, written in TypeScript. Contracts are safely isolated in their own WebAssembly virtual machines.

This module is designed to be used in Node or the browser.

## Usage

```js
let Contract = require('contract-vm')

let bindings = {
  print(msg) {
    console.log(msg)
  }
}

let contract = Contract(codeBuffer, bindings)

let [result, gasCost] = contract.someMethod({ foo: 'bar' })
```

### Features

- Enforced determinism
- Metered execution (ie. gas)
- Lightweight and fast
- Easily extensible with custom host bindings
