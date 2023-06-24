import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import * as roadshow from '@hydrofoil/roadshow-vite/server'
import absoluteUrl from 'absolute-url'
import rdf from '@rdfjs/express-handler'
import config from './vite.config.js'
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
    dev: {
      modulePath: path.resolve(__dirname, 'src/server.ts'),
      indexPath: path.resolve(__dirname, 'index.html'),
    },
    production: {
      modulePath: path.resolve(__dirname, 'dist/server/server.js'),
      indexPath: path.resolve(__dirname, 'dist/client/index.html'),
      clientBuildPath: path.resolve(__dirname, 'dist/client'),
    },
  }))

  app.listen(process.env.PORT || 3000)
}

createServer()
