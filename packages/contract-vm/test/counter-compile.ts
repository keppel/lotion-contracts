let compile = require('contract-compiler')
let { Contract, Host } = require('../')
let { parse, stringify } = require('deterministic-json')

async function main() {
  // Test single contract
  let counterCode = await compile(`contracts/counter.ts`)
  let countifierCode = await compile(`contracts/countifier.ts`)
  let greeterCode = await compile(`contracts/greeter.ts`)

  // Test multi-contract host
  let host = new Host()
  let counterAddress = host.addContract(counterCode)
  console.log('counter address:')
  console.log(counterAddress)
  let countifierAddress = host.addContract(countifierCode)

  let greeterAddress = host.addContract(greeterCode)
  console.log('greeter address:')
  console.log(greeterAddress)

  // let message = { sender: 'judd', to: address, method: 'increment', data: [3] }

  function consumeGas(gas: any) {
    console.log(`consumed ${gas} gas`)
  }
  // console.log(host.execute(message, consumeGas)) // 103

  let counter = host.contracts[counterAddress]
  let countifier = host.contracts[countifierAddress]
  console.log(counter.contract.increment(20)) // 20
  console.log(countifier.contract.addToCount(10)) // 30
  console.log(counter.contract.count) // 30
  console.log(host.contracts[greeterAddress].contract.greet('world'))
}
main()
