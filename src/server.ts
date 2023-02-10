import {getConfig} from './utils'
import * as fs from 'node:fs'
//@ts-ignore
import Koa from 'koa'

const config = getConfig()

const app = new Koa()

app.use(async (ctx) => {


  if (ctx.request.url === `/image/${config.parentCollection}/${config.parentToken}`) {
    const path = `${config.imagesDir}/${config.fileName}`
    const src = fs.createReadStream(path)
    ctx.response.set("content-type", 'image/png')
    ctx.body = src
  } else {
    ctx.body = 'Hello World'
  }
})

app.listen(config.port, config.host, () => {
  console.log(`Server listening on ${config.host}:${config.port}`)
  console.log(`http://localhost:${config.port}`)
  console.log(`http://localhost:${config.port}/image/${config.parentCollection}/${config.parentToken}`)
})
