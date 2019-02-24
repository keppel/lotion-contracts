let loader = require('assemblyscript/lib/loader')
const CONTRACT_CLASS_NAME = 'Contract'

export class Contract {
  public instance
  public memory
  public contract
  public contractInstance

  constructor(public code, private bindings?) {
    this.contract = new Proxy(
      {},
      {
        get: (target, name, receiver): any => {
          if (typeof this.contractInstance[name] === 'function') {
            return (...args) => {
              this.initialize()
              return this.contractInstance[name](...args)
            }
          } else if (this.contractInstance[name]) {
            this.initialize()
          }
          return this.contractInstance[name]
        },

        set: (target, name, value): any => {
          this.initialize()
          this.contractInstance[name] = value
        }
      }
    )

    this.initialize()
  }

  initialize() {
    this.instance = loader.instantiateBuffer(this.code, {
      contract: this.bindings
    })

    if (!this.instance[CONTRACT_CLASS_NAME]) {
      throw new Error(
        `Contract must an export a class named ${CONTRACT_CLASS_NAME}`
      )
    }
    this.contractInstance = new this.instance[CONTRACT_CLASS_NAME]()
    if (!this.memory) {
      this.memory = this.instance.memory.buffer
    }
    assignMemory(this.instance.memory.buffer, this.memory)
    this.memory = this.instance.memory.buffer
  }
}

function assignMemory(dest, src) {
  let a = new Uint32Array(src)
  let b = new Uint32Array(dest)
  Object.assign(b, a)
}
