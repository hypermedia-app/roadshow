import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import { ex } from 'test-data/ns.js'
import { dash } from '@tpluscode/rdf-ns-builders'
import config from '@hydrofoil/roadshow-vite/config'
import * as roadshow from '@hydrofoil/roadshow-vite/server'
import { loadData } from 'test-data'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
  const app = express()

  app.use(await roadshow.middleware({
    vite: config,
    indexPath: path.resolve(__dirname, 'index.html'),
    async loadGraph() {
      const graph = await loadData('shape/only-header.ttl', 'example/page.ttl')
      return graph.node(ex.PageWithTitle).addOut(dash.shape, ex.HeaderOnlyShape)
    },
  }))

  app.listen(3000)
}

createServer()
