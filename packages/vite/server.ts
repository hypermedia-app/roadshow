import fs from 'fs'
import express from 'express'
import { InlineConfig, createServer } from 'vite'

interface Config {
  modulePath: string
  vite: InlineConfig
  indexPath: string
  ssrPlaceholder?: string
}

export async function middleware({ modulePath, vite, indexPath, ssrPlaceholder = '<!--ssr-outlet-->' }: Config): Promise<express.RequestHandler> {
  const router = express.Router()

  const viteServer = await createServer(vite)
  router.use(viteServer.middlewares)

  router.use('*', async (req, res, next) => {
    const url = req.originalUrl

    try {
      let template = fs.readFileSync(indexPath, 'utf-8')
      // TODO: try to transform after dynamically generating a module
      template = await viteServer.transformIndexHtml(url, template)

      const { render } = await viteServer.ssrLoadModule(modulePath)

      const appHtml = await render({ req })

      const html = template.replace(ssrPlaceholder, appHtml)
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e: any) {
      viteServer.ssrFixStacktrace(e)
      next(e)
    }
  })

  return router
}
