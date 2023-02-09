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
  const sdk = await getSdk(config.BASE_URL as string, config.MNEMONIC)

  const imgArray = await getTokenImageUrls(sdk, {
    collectionId: Number(config.PARENT_COLLECTION),
    tokenId: Number(config.PARENT_TOKEN),
  })
  mergeImages(imgArray, Number(config.OFFSET), config.FILE_PATH as string)
}

main().catch((error) => {
  console.error(error)
})
