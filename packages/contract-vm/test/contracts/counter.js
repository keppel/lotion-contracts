module.exports = {
  count: 0,
  increment(n = 1) {
    this.count += n
    return this.count
  },
  things: []
}
