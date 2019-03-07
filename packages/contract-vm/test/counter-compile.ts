let compile = require('contract-compiler')
let { Contract, Host } = require('../')
let { parse, stringify } = require('deterministic-json')

async function main() {
  // Test single contract
  let code = await compile(`contracts/counter.ts`)
  let contractWrapper = new Contract(code)
  let { contract } = contractWrapper
  contract.count = 1
  contract.increment(50)
  contract.increment(49)

  // Test multi-contract host
  let host = new Host()
  let address = host.addContract(contractWrapper)
  let message = { sender: 'judd', to: address, method: 'increment', data: [3] }

  function consumeGas(gas) {
    //console.log(`consumed ${gas} gas`)
  }
  console.log(host.execute(message, consumeGas)) // 103

  let saved = host.save()
  let chkpt = parse(stringify(saved))
  console.log(host.execute(message, consumeGas)) // 106
  console.log(host.execute(message, consumeGas)) // 109
  host.load(chkpt)
  console.log(host.execute(message, consumeGas)) // 106
}
main()
