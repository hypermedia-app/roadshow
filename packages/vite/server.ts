import fs from 'fs'
import express from 'express'
import { InlineConfig, createServer } from 'vite'

interface Paths {
  modulePath: string
  indexPath: string
}

interface Config {
  devMode?: boolean
  vite: InlineConfig
  ssrPlaceholder?: string
  dev: Paths
  production: Paths & {
    clientBuildPath: string
  }
}

export async function middleware({
  devMode = process.env.NODE_ENV !== 'production',
  dev,
  production,
  vite,
  ssrPlaceholder = '<!--ssr-outlet-->',
}: Config): Promise<express.RequestHandler> {
  const router = express.Router()

  const viteServer = await createServer(vite)

  let indexPath: string
  let serverModule: Promise<any>
  if (devMode) {
    indexPath = dev.indexPath
    serverModule = viteServer.ssrLoadModule(dev.modulePath)

    router.use(viteServer.middlewares)
  } else {
    indexPath = production.indexPath
    serverModule = import(production.modulePath)

    router.use(express.static(production.clientBuildPath))
  }

  router.use('*', async (req, res, next) => {
    const url = req.originalUrl

    try {
      let template = fs.readFileSync(indexPath, 'utf-8')
      if (devMode) {
        // TODO: try to transform after dynamically generating a module
        template = await viteServer.transformIndexHtml(url, template)
      }

      const { render } = await serverModule

      const appHtml = await render({
        req,
        res,
      })
      if (!appHtml) {
        return next()
      }

      const html = template.replace(ssrPlaceholder, appHtml)
      return res.status(200)
        .set({ 'Content-Type': 'text/html' })
        .end(html)
    } catch (e: any) {
      viteServer.ssrFixStacktrace(e)
      return next(e)
    }
  })

  return router
}
