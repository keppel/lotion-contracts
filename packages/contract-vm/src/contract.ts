let metering = require('metering')
let SES = require('ses')
let { stringify, parse } = require('deterministic-json')
let bs58 = require('bs58')
let { createHash } = require('crypto')
import { Host } from './host'

export class Contract {
  public exports: any

  public state: any
  public address: string
  private meteredCode: string

  constructor(public code: string, initialState: any = {}, private host: Host) {
    this.address = bs58.encode(
      createHash('sha256')
        .update(code)
        .digest()
    )
    // TODO: randomly generated metering function name to prevent shadowing
    this.state = initialState
    let meteringFunctionName = 'consumeGas'
    this.meteredCode = metering('consumeGas', this.code)
    const rootRealm: any = SES.makeSESRootRealm({
      consoleMode: 'allow',
      errorStackMode: 'allow'
    })
    this.exports = new Proxy(
      rootRealm.evaluate(this.meteredCode, {
        [meteringFunctionName]: (value: any) => {
          if (this.host.consumeGas) {
            this.host.consumeGas(1)
          }
          return value
        },
        JSON: {},
        module: { exports: {} },
        ...this.host.makeBindings(this.address)
      }),
      {
        get: (target, key) => {
          if (typeof target[key] === 'function') {
            return (...args: any[]) => {
              this.initialize()
              let result = target[key](...args)
              // save state from contract
              Object.assign(this.state, parse(stringify(this.exports)))
              return result
            }
          } else {
            return target[key]
          }
        }
      }
    )

    Object.assign(this.exports, initialState)
  }

  initialize() {
    Object.assign(this.exports, this.state)
  }
}
