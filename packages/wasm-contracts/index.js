let VM = require('./lib/vm.js')

exports.coinsHandler = function(opts = {}) {
  let vm

  return {
    initialState: {},
    initialize: function(state, context) {
      state.storage = {}
      state.binaries = {}
      state.balances = {}
      state.gasPrice = opts.gasPrice || 0.0001
      vm = new VM(state, context)
    },
    onBlock: function(state, context) {
      try {
        if (!vm) {
          vm = new VM(state, context)
        }
        vm.context = context
        vm.stateRef = state
        vm.onBlock()
      } catch (e) {
        console.log(e)
      }
    },
    onOutput(output, state, context) {
      if (!vm) {
        vm = new VM(state, context)
      }
      vm.context = context
      vm.stateRef = state
      if (output.action === 'create') {
        verifyContractCreationOutput(output)
        let contractAddress = vm.createContract(
          output.contractCode,
          output.amount
        )
      }
      if (output.action === 'message') {
        verifyContractMessageOutput(output)
        vm.exec({
          address: output.contractAddress,
          data: output.data,
          method: output.method,
          amount: output.amount
        })
      }
    }
  }
}

function verifyContractCreationOutput(output) {
  if (!Buffer.isBuffer(output.contractCode)) {
    throw new Error('output.contractCode must be a buffer')
  }
}

const blacklistedMethodNames = ['onBlock', 'init']
function verifyContractMessageOutput(output) {
  if (blacklistedMethodNames.indexOf(output.method) !== -1) {
    throw new Error('Blacklisted method name: ' + output.method)
  }
}

exports.utils = require('./lib/utils.js')
exports.client = require('./lib/client.js')
