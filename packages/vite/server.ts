import fs from 'fs'
import express from 'express'
import { InlineConfig, createServer } from 'vite'
import { render } from '@hydrofoil/roadshow-ssr'
import type { GraphPointer } from 'clownface'
import type { NamedNode } from '@rdfjs/types'

interface Config {
  vite: InlineConfig
  indexPath: string
  loadGraph: () => Promise<GraphPointer<NamedNode>>
  ssrPlaceholder?: string
}

export async function middleware({ vite, indexPath, loadGraph, ssrPlaceholder = '<!--ssr-outlet-->' }: Config): Promise<express.RequestHandler> {
  const router = express.Router()

  const viteServer = await createServer(vite)
  router.use(viteServer.middlewares)

  router.use('*', async (req, res, next) => {
    const url = req.originalUrl

    try {
      let template = fs.readFileSync(indexPath, 'utf-8')
      // TODO: try to transform after dynamically generating a module
      template = await viteServer.transformIndexHtml(url, template)

      const pointer = await loadGraph()
      const appHtml = await render({ pointer })

      const html = template.replace(ssrPlaceholder, appHtml)
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e: any) {
      viteServer.ssrFixStacktrace(e)
      next(e)
    }
  })

  return router
}
