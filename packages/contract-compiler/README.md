# Contract Compiler

This is a compiler for WebAssembly smart contracts written in AssemblyScript. It can be used from the command line with Node, or used programmatically in Node or the browser.

## Programmatic usage

```js
let compile = require('contract-compiler')

compile('./path/to/mycontract.ts').then(code => {
  console.log(code) // <Buffer 25 5a e0 ae ... >
})
```

## CLI usage

```bash
$ npx contract-compiler mycontract.ts > code.wasm
```
