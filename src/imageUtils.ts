import mergeImg from 'merge-img'
import type {Client, TokenIdQuery} from '@unique-nft/sdk'

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



export const mergeImages = async (
  imgArray: string[],
  offset: number,
  outputFilePath: string
): Promise<string> => {
  const img = await mergeImg(imgArray, {
    align: 'center',
    offset,
  })

  return new Promise<string>((resolve, reject) => {
    img.write(outputFilePath, (err) => {
      if (err) {
        reject(err)
      } else {
        console.log(`Images were merged. The output is ${outputFilePath}`)
        resolve(outputFilePath)
      }
    })
  })
}
