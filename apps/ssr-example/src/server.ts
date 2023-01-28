import * as roadshow from '@hydrofoil/roadshow-ssr'
import { loadData } from 'test-data'
import { dash } from '@tpluscode/rdf-ns-builders'
import './viewers.js'
import express from 'express'
import $rdf from 'rdf-ext'
import clownface from 'clownface'
import isGraphPointer from 'is-graph-pointer'

export async function render({ req }: { req: express.Request }) {
  const id = req.originalUrl.substring(1)

  const dataset = await $rdf.dataset().import(loadData(id))
  const pointer = clownface({ dataset }).namedNode(id)

  const shape = pointer.out(dash.shape)
  if (isGraphPointer.isNamedNode(shape)) {
    await dataset.import(loadData(shape.value))
  }

  return roadshow.render({ pointer })
}
