let metering = require('metering')
let SES = require('ses')

export class Contract {
  public exports: any

  private meteredCode: string

  constructor(
    public code: string,
    private bindings = {},
    private consumeGas?: any
  ) {
    // TODO: randomly generated metering function name to prevent shadowing
    let meteringFunctionName = 'consumeGas'
    this.meteredCode = metering('consumeGas', this.code)
    const rootRealm: any = SES.makeSESRootRealm({
      consoleMode: 'allow',
      errorStackMode: 'allow'
    })
    this.exports = rootRealm.evaluate(this.meteredCode, {
      [meteringFunctionName]: (value: any) => {
        if (this.consumeGas) {
          this.consumeGas()
        }
        return value
      },
      JSON: {},
      module: { exports: {} }
    })
  }

  useMeter(consumeGas?: any) {
    this.consumeGas = consumeGas
  }
}
