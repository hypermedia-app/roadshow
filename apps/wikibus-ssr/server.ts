import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import config from '@hydrofoil/roadshow-vite/config'
import * as roadshow from '@hydrofoil/roadshow-vite/server'
import absoluteUrl from 'absolute-url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
  const app = express()

  app.use(absoluteUrl())
  app.use(await roadshow.middleware({
    vite: config,
    modulePath: path.resolve(__dirname, './src/server.ts'),
    indexPath: path.resolve(__dirname, 'index.html'),
  }))

  app.listen(3000)
}

createServer()
