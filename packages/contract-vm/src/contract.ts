let metering = require('metering')
let SES = require('ses')

type GasMeter = ((value: any) => any) | null

export class Contract {
  public contract: any

  private meteredCode: string
  private consumeGas: GasMeter | undefined

  constructor(public code: string, private bindings = {}) {
    // TODO: randomly generated metering function name to prevent shadowing
    let meteringFunctionName = 'consumeGas'
    this.meteredCode = metering('consumeGas', this.code)
    const rootRealm: any = SES.makeSESRootRealm({
      consoleMode: 'allow',
      errorStackMode: 'allow'
    })
    let contractExports = {}
    rootRealm.evaluate(this.meteredCode, {
      [meteringFunctionName]: this.consumeGas,
      JSON: {},
      module: { exports: contractExports },
      exports: contractExports
    })

    this.contract = contractExports
  }

  useMeter(consumeGas?: GasMeter) {
    this.consumeGas = consumeGas
  }
}
