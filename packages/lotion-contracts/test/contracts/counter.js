module.exports = {
  count: 0,
  increment(n = 1) {
    this.count += n
  },
  getCaller() {
    return Contract.getCallerAddress()
  }
}
