import Router from '@koa/router'
import { Address } from '@unique-nft/utils/address'
import Koa from 'koa'
import * as fs from 'node:fs'
import { getTokenImageUrls, mergeImages } from './imageUtils'
import { KNOWN_AVATARS, KNOWN_NETWORKS, SDKFactories, getConfig } from './utils'

const config = getConfig()

const app = new Koa()
const router = new Router()

const lastRenderTimes: Record<string, number> = {}
const CACHE_TIME = 10 * 1000
let offset = 0

router.get(`/:avatar/:network/:collectionId/:tokenId`, async (ctx) => {
  const avatar: string = ctx.params.avatar || ''
  if (!Object.values(KNOWN_AVATARS).includes(avatar as any)) {
    ctx.body = `Unknown avatar (${avatar}). Please use one of [${Object.values(KNOWN_AVATARS)}]`
    ctx.status = 400
    return
  }
  switch (avatar) {
    case KNOWN_AVATARS.Workaholic:
      offset = -850
      break
    case KNOWN_AVATARS.Pirate:
      offset = -1024
      break
  }

  const network: string = ctx.params.network || ''
  if (!KNOWN_NETWORKS.includes(network)) {
    ctx.body = `Unknown network ${network}. Please use one of ${KNOWN_NETWORKS.join(', ')}`
    ctx.status = 400
    return
  }

  const collectionId = parseInt(ctx.params.collectionId || '', 10)
  const tokenId = parseInt(ctx.params.tokenId || '', 10)

  if (!Address.is.collectionId(collectionId)) {
    ctx.body = `Invalid collectionId ${collectionId}`
    ctx.status = 400
    return
  }

  if (!Address.is.tokenId(tokenId)) {
    ctx.body = `Invalid tokenId ${tokenId}`
    ctx.status = 400
    return
  }

  const path = `${config.imagesDir}/${network}-${collectionId}-${tokenId}.png`
  try {
    if (!fs.existsSync(config.imagesDir)) {
      fs.mkdirSync(config.imagesDir)
    }
  } catch (err) {
    console.error(err)
    ctx.status = 400
    return
  }

  // Check if the image is cached
  // If not, render it and save it
  if (!lastRenderTimes[path] || Date.now() - lastRenderTimes[path] > CACHE_TIME) {
    const sdk = SDKFactories[network as keyof typeof SDKFactories]()

    const imgArray = await getTokenImageUrls(sdk, {collectionId, tokenId})
    await mergeImages(imgArray, offset, path)
    lastRenderTimes[path] = Date.now()
  }
  console.log(`Serving ${path}...`)

  const stream = fs.createReadStream(path)
  ctx.response.set('content-type', 'image/png')
  ctx.body = stream
})

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(config.port, config.host, () => {
  console.log(`Server listening on ${config.host}:${config.port}`)
  console.log(`http${['localhost', '127.0.0.1'].includes(config.host) ? '' : 's'}://${config.host}:${config.port}`)
})
