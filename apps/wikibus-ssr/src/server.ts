import * as roadshow from '@hydrofoil/roadshow-ssr'
import './viewers.js'
import express from 'express'
import $rdf from 'rdf-ext'
import { loadData as loadPage } from 'test-data'
import clownface from 'clownface'
// import { construct } from '@hydrofoil/shape-to-query'
// import { dash, schema } from '@tpluscode/rdf-ns-builders'
// import isGraphPointer from 'is-graph-pointer'
import { readFile } from 'fs/promises'
import { join } from 'path'
import url from 'url'
import sparql from './sparql.js'

const pages = new Map([
  ['', 'index'],
])

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

export async function render({ req }: { req: express.Request }) {
  const path = req.originalUrl.substring(1)
  const page = pages.get(path)

  const stream = loadPage(`../pages/${page}`, import.meta.url)
  if (!stream) {
    return undefined
  }

  const dataset = await $rdf.dataset().import(stream)
  const id = req.absoluteUrl()
  const pointer = clownface({ dataset }).namedNode(id)

  await dataset.import(await loadResource(`../pages/${page}.rq`))

  return roadshow.render({ pointer })
}

async function loadResource(path: string) {
  const query = await readFile(join(__dirname, path))

  return sparql.query.construct(query.toString())
}
