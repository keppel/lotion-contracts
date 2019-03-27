let os = require('os')
let fs = require('fs')
let { join } = require('path')
let coins = require('coins')

function loadWallet(client) {
  let privKey
  let path = join(os.homedir(), '.coins')
  if (!fs.existsSync(path)) {
    privKey = generateSecpPrivateKey()
    fs.writeFileSync(path, privKey.toString('hex'), 'utf8')
  } else {
    privKey = Buffer.from(fs.readFileSync(path, 'utf8'), 'hex')
  }

  // add {route: 'someroute'} if coins module has a route
  return coins.wallet(privKey, client, { route: 'pbtc' })
}

exports.loadWallet = loadWallet
