let metering = require('metering')
let modbox = require('modbox')
let { stringify, parse } = require('deterministic-json')
let bs58 = require('bs58')
let { createHash } = require('crypto')
import { Host } from './host'

export class Contract {
  public exports: any

  public state: any
  public address: string

  constructor(
    public code: string,
    initialState: any = null,
    private host: Host
  ) {
    this.address = bs58.encode(
      createHash('sha256')
        .update(code)
        .digest()
    )
    if (initialState) {
      this.state = initialState
    } else {
      /**
       * Initialize a box and read/save the initial state
       */
      let box = modbox(this.code, {
        globals: {
          ...this.host.bindings
        },
        computeLimit: Infinity,
        onBurn() {
          if (host.consumeGas) {
            host.consumeGas(1)
          }
        }
      })

      this.state = JSON.parse(JSON.stringify(box))
    }

    this.exports = new Proxy(
      {},
      {
        get: (target, key) => {
          let box = modbox(this.code, {
            globals: {
              ...this.host.bindings
            },
            computeLimit: Infinity,
            onBurn() {
              if (host.consumeGas) {
                host.consumeGas(1)
              }
            },
            module: { exports: this.state }
          })

          return box[key]
        }
      }
    )
  }
}
