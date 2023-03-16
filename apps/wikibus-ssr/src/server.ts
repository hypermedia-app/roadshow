/* eslint-disable no-console */
import * as roadshow from '@hydrofoil/roadshow-ssr'
import './viewers.js'
import express from 'express'
import $rdf from 'rdf-ext'
import { loadData as loadPage } from 'test-data'
import clownface, { AnyContext, AnyPointer, GraphPointer } from 'clownface'
import onetime from 'onetime'
import { rdf, schema, sh } from '@tpluscode/rdf-ns-builders'
import isGraphPointer from 'is-graph-pointer'
import type DatasetExt from 'rdf-ext/lib/Dataset'
import { NamedNode } from 'rdf-js'
import { constructQuery } from '@hydrofoil/shape-to-query'
import sparql from './sparql.js'

const loadShapes = onetime(async () => {
  const stream = <any>loadPage('../pages/index.trig', import.meta.url)
  const dataset = await $rdf.dataset().import(stream)
  const graph = clownface({ dataset })

  console.log(`Loaded pages ${graph.has(rdf.type, schema.WebPage).values}`)

  return graph
})

export async function render({ req }: { req: express.Request }) {
  const path = req.originalUrl.substring(1)

  const resource = $rdf.namedNode(`https://new.wikibus.org/${path}`)

  const allPages = await loadShapes()
  const shape = findShape(allPages, resource)
  if (!shape) {
    return undefined
  }

  const dataset = await $rdf.dataset().import(await constructQuery(shape).execute(sparql.query))

  return roadshow.render({
    pointer: clownface({ dataset }).namedNode(resource),
  })
}

function findShape(graph: AnyPointer<AnyContext, DatasetExt>, resource: NamedNode): GraphPointer | null {
  const shape = graph.has(sh.targetNode, resource)
  if (isGraphPointer.isGraphPointer(shape)) {
    return shape
  }

  console.warn(`Page not found for <${resource.value}>`)
  return null
}
