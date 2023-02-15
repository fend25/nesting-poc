import * as fs from 'node:fs'
import {getConfig, getSdk} from './utils'
//@ts-ignore
import Router from '@koa/router'
import Koa from 'koa'
import {getTokenImageUrls} from '.'
import {mergeImages} from './imageUtils'

let lastRenderTime = 0
const CACHE_TIME = 10 * 1000

const config = getConfig()

const app = new Koa()
const router = new Router()

const rerenderAndSaveImage = async () => {
  const sdk = await getSdk(config.baseUrl, config.mnemonic)

  const imgArray = await getTokenImageUrls(sdk, {
    collectionId: config.parentCollection,
    tokenId: config.parentToken,
  })

  const file = await mergeImages(imgArray, config.offset, `${config.imagesDir}/${config.fileName}`)
}

router
  .get(`/image/${config.parentCollection}/${config.parentToken}`, async (ctx) => {
    const path = `${config.imagesDir}/${config.fileName}`
    if (Date.now() - lastRenderTime > CACHE_TIME) {
      await rerenderAndSaveImage()
      lastRenderTime = Date.now()
    }
    const stream = fs.createReadStream(path)
    ctx.response.set('content-type', 'image/png')
    ctx.body = stream
  })
  .get('/', (ctx) => {
    ctx.body =
      'Server is running. The image is available at <server>:<port>/image/<parent-collection-id>/<parent-token-id>'
  })

/* app.use(async (ctx) => {
  console.log('Working ...')

  if (ctx.request.url === `/image/${config.parentCollection}/${config.parentToken}`) {
    
}) */

app.use(router.routes()).use(router.allowedMethods())

app.listen(config.port, config.host, () => {
  console.log(`Server listening on ${config.host}:${config.port}`)
  console.log(`http://localhost:${config.port}`)
  console.log(
    `http://localhost:${config.port}/image/${config.parentCollection}/${config.parentToken}`
  )
})
