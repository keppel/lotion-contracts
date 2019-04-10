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

test('gas consumption', function(t) {
  let gasHogCode = fs.readFileSync('./test/contracts/gashog.js').toString()

  let host = new Host({})
  let hogAddress = host.addContract(gasHogCode)

  let gasConsumed = 0

  host.consumeGas = function() {
    gasConsumed++
    if (gasConsumed >= 100) {
      throw new Error('out of gas')
    }
  }

  try {
    host.contracts[hogAddress].exports.loopForever()
    t.fail()
  } catch (e) {
    t.equals(gasConsumed, 100)
    t.end()
  }
})
