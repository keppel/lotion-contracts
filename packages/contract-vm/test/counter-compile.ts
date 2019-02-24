let compile = require('contract-compiler')
let { Contract, Host } = require('../')

const contractBindings = {
  foo: function() {}
}

async function main() {
  // Test single contract
  let code = await compile(`contracts/counter.ts`)
  let { contract } = new Contract(code, contractBindings)
  contract.count = 1
  contract.increment(50)
  contract.increment(50)

  // Test multi-contract host
  let host = new Host({})
  console.log(host)
}
main()
