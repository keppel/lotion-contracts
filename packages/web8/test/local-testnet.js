const GCI = '11eb149f2057bd490b91479ef46850185900056155ea927ef7fe48795f16035d'

let Web8 = require('../')

async function main() {
  let web8 = await Web8(GCI)

  let contractAddress = 'HUefeoLzDMG9Np3Xgs5RDwjUk8qfgRJVAcETDL7xZnGr'
  let delegatorAddress = '7oQNmPuYFmqTMuWpGGfuGyXVYRgqvMW9oqy416BcNxLa'

  let counter = web8.getContract(contractAddress)
  let delegator = web8.getContract(delegatorAddress)

  console.log(await counter.count)
  // console.log(await delegator.doCall(contractAddress, 'increment', 3))

  // console.log(await web8.client.state.pbtc.accounts.mappum)
  // console.log(await counter.claimFunds('mappum', 123))
  // console.log(web8)
  // console.log(await contracts[counterAddress].count)
  // console.log(await web8.contracts[counterAddress].increment(4))
  // console.log(await contracts[counterAddress].count)
}

main()
