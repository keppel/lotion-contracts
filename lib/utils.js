let fs = require('fs')
let asc = require('assemblyscript/cli/asc')
let tempy = require('tempy')

exports.compile = function compile(tsPath) {
  return new Promise((resolve, reject) => {
    let tmpPath = tempy.file({ extension: 'wasm' })
    asc.main(
      [tsPath, '--binaryFile', tmpPath, '--baseDir', '/', '--optimize'],
      {},
      function(err) {
        if (err) {
          throw err
        } else {
          resolve(fs.readFileSync(tmpPath))
        }
      }
    )
  })
}

exports.buildContractCreationTxOutput = function({ code, endowment }) {
  return {
    type: 'contract',
    action: 'create',
    amount: endowment,
    contractCode: code
  }
}
