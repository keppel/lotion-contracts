let { connect } = require('lotion')
let { loadWallet } = require('../../web8/lib/wallet.js')
let fs = require('fs')

async function main() {
  let client = await connect(process.env.gci)

  let wallet = loadWallet(client)
  console.log(wallet)

  let result = await wallet.send({
    type: 'contract',
    action: 'create',
    amount: 1000,
    code: fs.readFileSync('./counter.js').toString()
  })
  console.log(result)

  result = await wallet.send({
    type: 'contract',
    action: 'message',
    amount: 1000,
    method: 'increment',
    data: [4],
    to: 'FDLqC4NBvhU6YyGbtaweNNfoyAiMfD34cySegfX6jCTy'
  })
  console.log(result)
}

main()
