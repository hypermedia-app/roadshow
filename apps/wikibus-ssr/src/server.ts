import * as roadshow from '@hydrofoil/roadshow-ssr'
import './viewers.js'
import express from 'express'
import $rdf from 'rdf-ext'
import { loadData } from 'test-data'
import clownface from 'clownface'

const pages = new Map([
  ['', 'index'],
])

export async function render({ req }: { req: express.Request }) {
  const path = req.originalUrl.substring(1)
  const page = pages.get(path)

  const stream = loadData(`../pages/${page}`, import.meta.url)
  if (!stream) {
    return undefined
  }

  const dataset = await $rdf.dataset().import(stream)
  const id = req.absoluteUrl()
  const pointer = clownface({ dataset }).namedNode(id)
  return roadshow.render({ pointer })
}
