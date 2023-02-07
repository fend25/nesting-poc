import mergeImg from 'merge-img'
import {createSdk} from './createSdk.mjs'
import config from './config.mjs'

async function main() {
  const {sdk} = await createSdk()
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
