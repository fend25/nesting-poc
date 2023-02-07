import mergeImg from 'merge-img'
import {createSdk} from './createSdk.mjs'
import config from './config.mjs'

/* mergeImg(['image-1.png', 'image-2.jpg'])
  .then((img) => {
    // Save image as file
    img.write('out.png', () => console.log('done'));
  }); */

/* async function generateImage({images, output, num}) {
  const img = await mergeImg(images)
  await new Promise<void>((resolve) => {
    img.write(output, () => resolve())
  })
  return num
} */

async function main() {
  const {sdk} = await createSdk()

  /* const tokenMain = await sdk.tokens.get({
    collectionId: 345,
    tokenId: 1,
  })

  const tokenEyebrows = await sdk.tokens.get({
    collectionId: 346,
    tokenId: 1,
  })
  const tokenHair = await sdk.tokens.get({
    collectionId: 346,
    tokenId: 2,
  })
  const tokenBeard = await sdk.tokens.get({
    collectionId: 346,
    tokenId: 3,
  }) */
  const imgArray: string[] = []

  const token = await sdk.tokens.get(config.parent);

  if (token.image.fullUrl)
    imgArray.push(token.image.fullUrl)
    
  const bundle = await sdk.tokens.getBundle(config.parent)

  bundle.nestingChildTokens.forEach((token) => {
    imgArray.push(token.image.fullUrl)
  })

  mergeImg(
    imgArray,
    {
      align: 'center',
      offset: -850,
    }
  ).then((img) => {
    // Save image as file
    img.write('out.png', () => console.log('Images were merged. The output is out.png'))
  })
}

main().catch((error) => {
  console.error(error)
})
