import {getSdk, getConfig} from './utils'
import {mergeImages} from './imageUtils'
import {Client} from '@unique-nft/sdk'

const getTokenImageUrls = async (sdk: Client, parentCollectionId: string | number): Promise<string[]> => {
  const imgArray: string[] = []

  const token = await sdk.tokens.get({collectionId: parentCollectionId, tokenId: 1})
  if (token.image.fullUrl) 
    imgArray.push(token.image.fullUrl)

  const bundle = await sdk.tokens.getBundle({collectionId: parentCollectionId, tokenId: 1})
  bundle.nestingChildTokens.forEach((token) => {
    imgArray.push(token.image.fullUrl)
  })

  return imgArray
}

async function main() {
  const config = getConfig()
  const sdk = await getSdk(config.BASE_URL as string, config.MNEMONIC)

  const imgArray = await getTokenImageUrls(sdk, config.PARENT_COLLECTION as string)
  mergeImages(imgArray, Number(config.OFFSET), config.FILE_PATH as string)
}

main().catch((error) => {
  console.error(error)
})
