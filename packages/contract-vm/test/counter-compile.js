let { Contract, Host } = require('../')
let { parse, stringify } = require('deterministic-json')
let fs = require('fs')
let test = require('tape')

test('saving and loading hosts', function(t) {
  // Test single contract
  let counterCode = fs.readFileSync('./test/contracts/counter.js').toString()

  // // Test multi-contract host
  let host = new Host({})
  let counterAddress = host.addContract(counterCode)

  host.contracts[counterAddress].exports.increment(7)
  let saved = host.save()
  host.contracts[counterAddress].exports.increment(2)
  // console.log('counter address: ' + counterAddress)
  let otherHost = new Host({})
  otherHost.load(saved)
  t.equals(host.contracts[counterAddress].exports.count, 9) // 9
  t.equals(otherHost.contracts[counterAddress].exports.count, 7) // 7
  t.end()
})
