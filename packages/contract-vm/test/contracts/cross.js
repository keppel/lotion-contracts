const counterAddress = 'AWaDno6zBbGw1Y9YLrcsXfqmGABVNHUoJKVzqyzXLkRA'

module.exports = {
  doIncrement() {
    let counter = contract.wrap(counterAddress)
    counter.increment(3)
    return counter.increment(4)
  }
}
