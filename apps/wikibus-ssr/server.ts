import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import config from '@hydrofoil/roadshow-vite/config'
import * as roadshow from '@hydrofoil/roadshow-vite/server'
import absoluteUrl from 'absolute-url'
import rdf from '@rdfjs/express-handler'
import { loadResource } from './src/loadResource.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
  const app = express()

  app.use(absoluteUrl())
  app.use(rdf())
  app.use(loadResource)
  app.use((req, res, next) => {
    if (res.locals.resource && !res.locals.webPage) {
      return res.dataset(res.locals.resource.dataset)
    }

    return next()
  })
  app.use(await roadshow.middleware({
    vite: config,
    modulePath: path.resolve(__dirname, './src/server.ts'),
    indexPath: path.resolve(__dirname, 'index.html'),
  }))

  app.listen(3000)
}

createServer()
