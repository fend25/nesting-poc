import {Client, TokenIdQuery} from '@unique-nft/sdk'
import {mergeImages} from './imageUtils'
import {getConfig, getSdk} from './utils'

export const getTokenImageUrls = async (
  sdk: Client,
  parentToken: TokenIdQuery
): Promise<string[]> => {
  const imgArray: string[] = []

  console.log(`Getting parent token (${parentToken.collectionId}/${parentToken.tokenId}) image`)
  const token = await sdk.tokens.get(parentToken)
  if (token.image.fullUrl) {
    imgArray.push(token.image.fullUrl)
  }

  console.log(
    `Getting bundle tokens image URLs for ${parentToken.collectionId}/${parentToken.tokenId}`
  )
  const bundle = await sdk.tokens.getBundle(parentToken)
  bundle.nestingChildTokens.forEach((token) => {
    imgArray.push((token as any).image.fullUrl)
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

  const file = await mergeImages(imgArray, config.offset, `${config.imagesDir}/${config.fileName}`)
}

main().catch((error) => {
  console.error(error)
})
