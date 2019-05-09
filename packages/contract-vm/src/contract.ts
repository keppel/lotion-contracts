let modbox = require('modbox')
let bs58 = require('bs58')
let { createHash } = require('crypto')
import { Host } from './host'

export class Contract {
  public exports: any

  public state: any
  public address: string
  public methodNames: string[] = []

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
        onBurn: () => {
          if (this.host.consumeGas) {
            this.host.consumeGas(1)
          }
        }
      })

      this.state = JSON.parse(JSON.stringify(box))
    }

    /**
     * Compute contract public API.
     * Does not charge gas.
     */

    let box = modbox(this.code, {
      globals: {
        ...this.host.bindings
      },
      computeLimit: 1e6,
      onBurn: () => {
        if (this.host.consumeGas) {
          this.host.consumeGas(1)
        }
      }
    })

    this.methodNames = Object.keys(box)
      .filter(key => typeof box[key] === 'function')
      .sort()

    this.exports = new Proxy(
      {},
      {
        get: (target, key) => {
          let box = modbox(this.code, {
            globals: {
              ...this.host.bindings
            },
            computeLimit: Infinity,
            onBurn: () => {
              if (this.host.consumeGas) {
                this.host.consumeGas(1)
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
