module.exports = {
  getCounterCallerAddress(counterAddress) {
    let counter = Contract.wrap(counterAddress)
    this.counterCallerResult = counter.getCaller()
  },
  getCaller() {
    this.myCaller = Contract.getCallerAddress()
  }
}
