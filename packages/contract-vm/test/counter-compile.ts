let compile = require('contract-compiler')
let ContractVM = require('../')

async function main() {
  let code = await compile(`contracts/counter.ts`)
  let { contract } = ContractVM(code, {})
  contract.count = 0
  // console.log(contract)
  contract.increment(80)
  contract.increment(70)
  console.log(contract.count)
}

main()
