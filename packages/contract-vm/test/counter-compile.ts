let { Contract, Host } = require('../')
let { parse, stringify } = require('deterministic-json')
let fs = require('fs')

async function main() {
  // Test single contract
  let counterCode = fs.readFileSync('./test/contracts/counter.js').toString()
  let crossCode = fs.readFileSync('./test/contracts/cross.js').toString()

  // let counterContract = new Contract(counterCode, { count: 2 })

  // // Test multi-contract host
  let host = new Host({})
  let counterAddress = host.addContract(counterCode)
  let crossAddress = host.addContract(crossCode)

  let msg = {
    sender: 'judd',
    method: 'increment',
    data: [4],
    to: counterAddress
  }
  let gasConsumed = 0
  host.execute(msg, function(n: number) {
    // console.log(`consumed ${n} gas`)
    gasConsumed += n
  })
  let saved = host.save()
  host.execute(msg, function(n: number) {})
  // console.log('counter address: ' + counterAddress)
  let otherHost = new Host({})
  otherHost.load(saved)
  console.log(host.contracts[counterAddress].exports.count) // 8
  console.log(otherHost.contracts[counterAddress].exports.count) // 4
}
main()
