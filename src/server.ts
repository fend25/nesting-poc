import Router from '@koa/router'
import Koa from 'koa'
import { getConfig } from './utils'

const config = getConfig()

const app = new Koa()
const router = new Router()

const lastRenderTimes: Record<string, number> = {}
const TIMEOUT = 10 * 1000

router.get(`/pollution/:city`, async (ctx) => {

  // Check if the timeout expired
  /* if (!lastRenderTimes[path] || Date.now() - lastRenderTimes[path] > CACHE_TIME) {
    const sdk = SDKFactories[network as keyof typeof SDKFactories]()

    const imgArray = await getTokenImageUrls(sdk, {collectionId, tokenId})
    await mergeImages(imgArray, offset, path)
    lastRenderTimes[path] = Date.now()
  }
  console.log(`Serving ${path}...`)

  const stream = fs.createReadStream(path)
  ctx.response.set('content-type', 'image/png')
  ctx.body = stream */
})

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(config.port, config.host, () => {
  console.log(`Server listening on ${config.host}:${config.port}`)
  console.log(`http${['localhost', '127.0.0.1'].includes(config.host) ? '' : 's'}://${config.host}:${config.port}`)
})
