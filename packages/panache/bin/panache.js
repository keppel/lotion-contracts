#!/usr/bin/env node

let lotion = require('lotion')
let coins = require('coins')
let contractHandler = require('../../wasm-contracts/index.js').coinsHandler

let app = lotion({
  initialState: {},
  genesisPath: 'genesis.json',
  keyPath: 'privkey.json',
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
  console.log('\n\n\n\n====== contract storage ======')
  console.log(JSON.stringify(state.pbtc.contract.storage, null, 2))
  console.log('\n\n\n\n====== account balances ======')
  console.log(JSON.stringify(state.pbtc.accounts, null, 2))
})

app.start().then(console.log)

process.on('uncaughtException', e => {
  console.log(e)
})
process.on('unhandledRejection', e => {
  console.log(e)
})
