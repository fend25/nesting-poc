import {createSdk} from './createSdk.mjs'
import config from './config.mjs'

async function nestTokens(sdk, signer, parent, nested) {
  const {parsed, error} = await sdk.tokens.nest.submitWaitResult({
    address: signer.getAddress(),
    parent,
    nested,
  })

  if (error) {
    console.log('The error occurred while nesting a token. ', error)
    process.exit()
  }

  console.log(`Token ${parsed.tokenId} from collection ${parsed.collectionId} successfully nested`)
}

async function main() {
  const {sdk, signer} = await createSdk()

  await nestTokens(sdk, signer, config.parent, config.nestedEyebrows)
  await nestTokens(sdk, signer, config.parent, config.nestedHair)
  await nestTokens(sdk, signer, config.parent, config.nestedBeard)

}

main().catch((error) => {
  console.error(error)
})
