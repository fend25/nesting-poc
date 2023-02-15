//@ts-ignore
import Router from '@koa/router'
import Koa from 'koa'
//@ts-ignore
import Router from '@koa/router'

import * as fs from 'node:fs'
import {getConfig} from './utils'
import {getTokenImageUrls} from '.'
import {mergeImages} from './imageUtils'
import {Sdk} from '@unique-nft/sdk'
import {Address} from '@unique-nft/utils/address'

const config = getConfig()

const app = new Koa()
const router = new Router()

const SDKs = <const>{
  opal: new Sdk({baseUrl: 'https://rest.unique.network/opal/v1'}),
  quartz: new Sdk({baseUrl: 'https://rest.unique.network/quartz/v1'}),
  unique: new Sdk({baseUrl: 'https://rest.unique.network/unique/v1'}),
  rc: new Sdk({baseUrl: 'https://rest.dev.uniquenetwork.dev/v1'}),
  uniqsu: new Sdk({baseUrl: 'https://rest.unq.uniq.su/v1'}),
}
const KNOWN_NETWORKS = Object.keys(SDKs)

const lastRenderTimes: Record<string, number> = {}
const CACHE_TIME = 10 * 1000

router.get(`/workaholic/:network/:collectionId/:tokenId`, async (ctx) => {
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

  const sdk = SDKs[network as keyof typeof SDKs]

  const path = `${config.imagesDir}/${network}-${collectionId}-${tokenId}.png`

  // Check if the image is cached
  // If not, render it and save it
  if ((!lastRenderTimes[path]) || (Date.now() - lastRenderTimes[path] > CACHE_TIME)) {
    const imgArray = await getTokenImageUrls(sdk, {collectionId, tokenId})
    await mergeImages(imgArray, config.offset, path)
    lastRenderTimes[path] = Date.now()
  }

  const stream = fs.createReadStream(path)
  ctx.response.set('content-type', 'image/png')
  ctx.body = stream
})

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(config.port, config.host, () => {
  console.log(`Server listening on ${config.host}:${config.port}`)
  console.log(`http://localhost:${config.port}`)
})
