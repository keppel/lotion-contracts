let lotion = require('lotion')
let coins = require('coins')
let contractHandler = require('../index.js')

let h = contractHandler()
console.log(h)

let app = lotion({
  initialState: {},
  rpcPort: 8888
})

app.use(
  'pbtc',
  coins({
    initialBalances: { '4C2tiCHRkdnC1VAwGowvG2CTQr5kReJ3y': 1e10 },
    handlers: {
      faucet: { onInput() {} },
      contract: contractHandler()
    }
  })
)

app.useBlock(function(state, ctx) {
  state.time = ctx.time
  console.log('\n\n\n\n\n\n\n')
  console.log('\n\n\n\n====== contract state ======')
  console.log(JSON.stringify(state.pbtc.contract.contracts, null, 2))
  console.log('\n\n\n\n====== account balances ======')
  console.log(JSON.stringify(state.pbtc.accounts, null, 2))
})

app.start().then(console.log)
