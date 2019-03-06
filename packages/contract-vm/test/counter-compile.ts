let compile = require('contract-compiler')
let { Contract, Host } = require('../')

const contractBindings = {
  foo: function() {}
}

async function main() {
  // Test single contract
  let code = await compile(`contracts/counter.ts`)
  let contractWrapper = new Contract(code, contractBindings)
  let { contract } = contractWrapper
  contract.count = 1
  contract.increment(50)
  contract.increment(49)

  // Test multi-contract host
  let host = new Host({})
  let address = host.contractStore.addContract(contractWrapper)
  let message = { sender: 'judd', to: address, method: 'increment', data: [3] }

  console.log(host.execute(message))
}
main()
