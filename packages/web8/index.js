let { utils } = require('wasm-contracts')
let { loadWallet } = require('./lib/wallet.js')
let connect = require('lotion-connect')
let { createHash } = require('crypto')

class Web8 {
  constructor(gci) {
    this.gci = gci
  }

  async initialize() {
    this.client = await connect(this.gci)
    this.wallet = loadWallet(this.client)
  }

  async createContract({ code, endowment }) {
    let output = utils.buildContractCreationTxOutput({ code, endowment })
    let response = await this.wallet.send(output)
    if (response.check_tx.code || response.deliver_tx.code) {
      console.error(response)
      throw new Error('Invalid contract creation transaction')
    }

    let contractAddress = createHash('sha256')
      .update(code)
      .digest('base64')
    return { contractAddress }
  }

  async sendTransaction(tx) {
    let output = {
      type: 'contract',
      action: 'message',
      amount: tx.amount,
      contractAddress: tx.to,
      data: tx.data,
      method: tx.method
    }
    let result = await this.wallet.send(output)
    return result
  }
}

module.exports = async gci => {
  let web8 = new Web8(gci)
  await web8.initialize()
  return web8
}
