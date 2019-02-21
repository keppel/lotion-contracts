let asc = require('assemblyscript/cli/asc')
let tempy = require('tempy')
let fs = require('fs')
let path = require('path')

module.exports = function compile(tsPath) {
  return new Promise((resolve, reject) => {
    tsPath = path.resolve(path.dirname(module.parent.filename), tsPath)

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
