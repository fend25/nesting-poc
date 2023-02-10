import {getConfig, getSdk} from './utils'

const main = async () => {
  const config = getConfig()
  const sdk = await getSdk(config.baseUrl, config.mnemonic)
  const address = (sdk.options.signer as any).getAddress()
  console.log(`Address: ${address}`)
  const result = await sdk.tokens.setProperties.submitWaitResult({
    address: address,
    collectionId: config.parentCollection,
    tokenId: config.parentToken,
    properties: [
      {
        key: 'i.u',
        value: `http://localhost:${config.port}/image/${config.parentCollection}/${config.parentToken}`
      }
    ]
  })
  console.log(result)
}

main().catch((error) => {
  console.error(error)
})
