let { loadWallet } = require('./lib/wallet.js')
let connect = require('lotion-connect')
let { createHash } = require('crypto')
let bs58 = require('bs58')
let Proxmise = require('proxmise')
let { Host } = require('contract-vm')
let getPath = require('lodash.get')

const NOMIC_GCI =
  '03c13f8701091afcb9338b7b0a4c4da5d6050da9c556c40942a68ffb437172e2'
class Web8 {
  constructor(gci) {
    this.gci = gci
    this.host = new Host({})
  }

  getContract(address, opts = {}) {
    /**
     * Build contract client proxy
     */
    return new Proxmise(
      async path => {
        await this.prepareHost(address)
        if (path.length === 0) {
          return this.host.contracts[address].exports
        } else {
          return getPath(this.host.contracts[address].exports, path)
        }
      },
      async (path, ...args) => {
        if (opts.dry) {
          await this.prepareHost(address)
          return getPath(this.host.contracts[address].exports, path)(...args)
        } else {
          this.sendMessage({
            to: address,
            method: path,
            data: args,
            amount: 0
          })
        }
      }
    )
  }

  async prepareHost(address) {
    /**
     * For now, load all contracts on the host.
     * In the future, lazily generate contract manifest
     */
    let savedHost = await this.client.state.pbtc.contract.contracts
    this.host.load(savedHost)
    if (!this.host.contracts[address]) {
      throw new Error('Contract with address ' + address + ' does not exist')
    }
  }

  async initialize() {
    if (this.gci) {
      this.client = await connect(this.gci)
    } else {
      this.client = await connect(
        NOMIC_GCI,
        {
          nodes: ['ws://134.209.50.224:1338'],
          genesis: require('./lib/genesis/nomic-v0.0.3.json')
        }
      )
    }
    this.wallet = loadWallet(this.client)
  }

  async createContract({ code, endowment, fee = 50 }) {
    let output = { type: 'contract', action: 'create', code, amount: endowment }

    let response = await this.wallet.send([
      output,
      { type: 'fee', amount: fee }
    ])

    if (response.check_tx.code || response.deliver_tx.code) {
      console.error(response)
      throw new Error('Invalid contract creation transaction')
    }

    let contractAddress = bs58.encode(
      createHash('sha256')
        .update(code)
        .digest()
    )
    return { contractAddress }
  }

  async sendMessage(message) {
    let output = {
      type: 'contract',
      action: 'message',
      amount: message.amount,
      to: message.to,
      data: message.data,
      method: message.method
    }

    let result = await this.wallet.send([output, { type: 'fee', amount: 50 }])
    if (result.check_tx.code || result.deliver_tx.code) {
      throw new Error(result.check_tx.log || result.deliver_tx.log)
    }
    return result
  }
}

module.exports = async (...args) => {
  let web8 = new Web8(...args)
  await web8.initialize()
  return web8
}
