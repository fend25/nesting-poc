import {getSdk, getConfig} from './utils'
import {mergeImages} from './imageUtils'
import {Client, TokenIdQuery} from '@unique-nft/sdk'

const getTokenImageUrls = async (sdk: Client, parentToken: TokenIdQuery): Promise<string[]> => {
  const imgArray: string[] = []

  const token = await sdk.tokens.get(parentToken)
  if (token.image.fullUrl) {
    imgArray.push(token.image.fullUrl)
  }

  const bundle = await sdk.tokens.getBundle(parentToken)
  bundle.nestingChildTokens.forEach((token) => {
    imgArray.push(token.image.fullUrl)
  })

  return imgArray
}

async function main() {
  const config = getConfig()
  const sdk = await getSdk(config.baseUrl, config.mnemonic)

  const imgArray = await getTokenImageUrls(sdk, {
    collectionId: config.parentCollection,
    tokenId: config.parentToken,
  })

  mergeImages(imgArray, config.offset, config.filePath)
}

main().catch((error) => {
  console.error(error)
})
