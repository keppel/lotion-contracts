let compile = require('contract-compiler')
let Contract = require('../')

async function main() {
  let code = await compile(`contracts/counter.ts`)
  console.log(Contract)
}

main()
