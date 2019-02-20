class Client {
  constructor() {
    console.log('constructed client')
  }
}

module.exports = (gci, opts) => {
  return new Client()
}
