import * as fs from 'node:fs'
import {getConfig, getSdk} from './utils'
//@ts-ignore
import Koa from 'koa'
import {getTokenImageUrls} from '.'
import {mergeImages} from './imageUtils'

const config = getConfig()

const app = new Koa()

let lastRenderTime = 0
const CACHE_TIME = 10 * 1000

const rerenderAndSaveImage = async () => {
  const sdk = await getSdk(config.baseUrl, config.mnemonic)

  const imgArray = await getTokenImageUrls(sdk, {
    collectionId: config.parentCollection,
    tokenId: config.parentToken,
  })

  const file = await mergeImages(imgArray, config.offset, `${config.imagesDir}/${config.fileName}`)
  console.log(file)
}

app.use(async (ctx) => {
  if (Date.now() - lastRenderTime > CACHE_TIME) {
    await rerenderAndSaveImage()
    console.log('merged!')
    lastRenderTime = Date.now()
    console.log(lastRenderTime)
  }

  if (ctx.request.url === `/image/${config.parentCollection}/${config.parentToken}`) {
    const path = `${config.imagesDir}/${config.fileName}`
    const src = fs.createReadStream(path)
    ctx.response.set('content-type', 'image/png')
    ctx.body = src
  } else {
    ctx.body = 'Hello World'
  }
})

app.listen(config.port, config.host, () => {
  console.log(`Server listening on ${config.host}:${config.port}`)
  console.log(`http://localhost:${config.port}`)
  console.log(
    `http://localhost:${config.port}/image/${config.parentCollection}/${config.parentToken}`
  )
})
