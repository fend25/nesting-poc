import Router from '@koa/router'
import { Address } from '@unique-nft/utils/address'
import Koa from 'koa'
import * as fs from 'node:fs'
import { getTokenComponents, composeImage, createImagePath } from './imageUtils'
import { KnownAvatar, KNOWN_NETWORKS, SDKFactories, getConfig } from './utils'

const config = getConfig()

const app = new Koa()
const router = new Router()

const lastRenderTimes: Record<string, number> = {}
// 3 seconds
const CACHE_TIME = 3 * 1000

router.get(`/:avatar/:network/:collectionId/:tokenId`, async (ctx) => {
  // Check the correctness of and transform every incoming parameter
  const avatar: string = ctx.params.avatar || ''
  if (!Object.values(KnownAvatar).includes(avatar as any)) {
    ctx.body = `Unknown avatar (${avatar}). Please use one of [${Object.values(KnownAvatar)}]`
    ctx.status = 400
    return
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

  // Create the path to which the image will be stored
  let path = '';
  try {
    path = createImagePath(config, `${network}-${collectionId}-${tokenId}.png`)
  } catch (err) {
    console.error(err)
    ctx.status = 400
    return
  }

  // Check if the image is cached
  // If not, render it and save it
  if (!lastRenderTimes[path] || Date.now() - lastRenderTimes[path] > CACHE_TIME) {
    // Initialize SDK
    const sdk = SDKFactories[network as keyof typeof SDKFactories]()

    // Collect image URLs from all tokens in the bundle
    const tokenArray = await getTokenComponents(sdk, {collectionId, tokenId})
    // Compose and save the image from those of all tokens in the bundle
    await composeImage(tokenArray, avatar as KnownAvatar, path)
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
