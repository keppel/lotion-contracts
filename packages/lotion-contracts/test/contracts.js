let handler = require('../index.js')()
let test = require('tape')
let fs = require('fs')

let mockContext = {
  mint() {},
  burn() {},
  transaction: { from: [{ pubkey: 'fake-pubkey' }] }
}
let mockSenderAddress = '79j5GwtX6U9AqzpsJiJMmC9uQbmSJDTFGGVaQmthiiAX'

test('cross-contract calls', function(t) {
  let createCounterOutput = {
    action: 'create',
    code: fs.readFileSync('./test/contracts/counter.js'),
    amount: 10000
  }
  let createCounterUserOutput = {
    action: 'create',
    code: fs.readFileSync('./test/contracts/counter-user.js'),
    amount: 10000
  }

  handler.onOutput(createCounterOutput, handler.initialState, mockContext)
  let counterAddress = Object.keys(handler.initialState.contracts)[0]
  handler.onOutput(createCounterUserOutput, handler.initialState, mockContext)
  let counterUserAddress = Object.keys(handler.initialState.contracts)[1]

  if (counterUserAddress === counterAddress) {
    throw new Error('Got wrong address for counterUser')
  }

  let messageOutput = {
    action: 'message',
    method: ['getCounterCallerAddress'],
    data: [counterAddress],
    to: counterUserAddress
  }

  handler.onOutput(messageOutput, handler.initialState, mockContext)

  t.equal(
    counterUserAddress,
    handler.initialState.contracts[counterUserAddress].state.counterCallerResult
  )

  t.equal(
    mockSenderAddress,
    handler.initialState.contracts[counterUserAddress].state.counterCallerResult
  )
  t.end()
})
