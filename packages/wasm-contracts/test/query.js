let { connect } = require('lotion')
let coins = require('coins')
let fs = require('fs')

const gci = 'a7f0f83c287e0631dad5fabbdc3694a61817fda0f6cd3ac102742d161fff39ae'

async function main() {
  let { state, send } = await connect(gci)

  let createContractTx = {
    type: 'peptide',
    to: {
      type: 'contract',
      action: 'create',
      amount: 1e9,
      contractCode: fs.readFileSync('../../contracts/counter/counter.wasm')
    },
    from: { amount: 1e9, type: 'faucet' }
  }

  let messageTx = {
    type: 'peptide',
    to: {
      type: 'contract',
      action: 'message',
      method: 'incrementMessageCount',
      amount: 1e8,
      data: {},
      contractAddress: 'SG+GvC8jGGfViaCsw8wgChNwQtkBQs8ALcXqIjmoSqA='
    },
    from: { amount: 1e8, type: 'faucet' }
  }

  console.log(await send(createContractTx))
  await delay()
  await send(messageTx)
  // console.log(await state.peptide.contract.storage)

  process.exit()
}
function delay(ms = 2000) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

main()
