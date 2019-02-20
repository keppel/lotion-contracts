let Lotion = require('lotion')
let wasmContracts = require('../index.js')

let app = Lotion({
  initialState: {},
  genesisPath: './genesis.json',
  keyPath: './privkey.json'
})

app.use('peptide', wasmContracts())
app.useBlock(function(state) {
  console.log('\n\n\n\n====== app state =======')
  console.log(JSON.stringify(state, null, 2))
})

app.start().then(async function(appInfo) {
  console.log(appInfo)
})

process.on('unhandledRejection', e => {
  console.log(e)
})
