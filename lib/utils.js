let fs = require('fs')
let asc = require('assemblyscript/cli/asc')
let tempy = require('tempy')
let path = require('path')

exports.compile = function compile(tsPath) {
  return new Promise((resolve, reject) => {
    let tmpPath = tempy.file({ extension: 'wasm' })
    asc.main(
      [
        path.resolve(tsPath),
        '--binaryFile',
        tmpPath,
        '--baseDir',
        '/',
        '--optimize'
      ],
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

// if (!module.parent) {
//   let loader = require('assemblyscript/lib/loader')
//   async function main() {
//     let path = 'add.ts'
//     let bin = await exports.compile(path)
//     let mod = new WebAssembly.Module(bin, {})
//     let instance = loader.instantiate(mod, {})
//     console.log(instance.add(2, 3))
//   }
//   main()
// }
