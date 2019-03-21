let { Contract, Host } = require('../')
let { parse, stringify } = require('deterministic-json')
let fs = require('fs')

async function main() {
  // Test single contract
  let counterCode = fs.readFileSync('./test/contracts/counter.js')
  let crossCode = fs.readFileSync('./test/contracts/cross.js')

  // let counterContract = new Contract(counterCode, { count: 2 })

  // // Test multi-contract host
  let host = new Host({})
  let counterAddress = host.addContract(counterCode)
  let crossAddress = host.addContract(crossCode)
  console.log(
    host.execute(
      {
        sender: 'judd',
        method: 'doIncrement',
        data: [4],
        to: crossAddress
      },
      function(n: number) {}
    )
  )
  console.log('counter address: ' + counterAddress)
  host.contracts[crossAddress].exports.doIncrement()
  console.log(host.contracts[counterAddress].exports.count)
}
main()
