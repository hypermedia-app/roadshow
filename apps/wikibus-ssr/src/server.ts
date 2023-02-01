/* eslint-disable no-console */
import * as roadshow from '@hydrofoil/roadshow-ssr'
import './viewers.js'
import express from 'express'
import $rdf from 'rdf-ext'
import { loadData as loadPage } from 'test-data'
import clownface, { AnyContext, AnyPointer, GraphPointer } from 'clownface'
// import { construct } from '@hydrofoil/shape-to-query'
// import { dash, schema } from '@tpluscode/rdf-ns-builders'
// import isGraphPointer from 'is-graph-pointer'
import { readFile } from 'fs/promises'
import { join } from 'path'
import url from 'url'
import type { Quad, Term } from '@rdfjs/types'
import onetime from 'onetime'
import { rdf, schema } from '@tpluscode/rdf-ns-builders'
import isGraphPointer from 'is-graph-pointer'
import { CONSTRUCT } from '@tpluscode/sparql-builder'
import type DatasetExt from 'rdf-ext/lib/Dataset'
import { turtle } from '@tpluscode/rdf-string'
import sparql from './sparql.js'
import { ex } from './ns.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const loadShapes = onetime(async () => {
  const stream = <any>loadPage('../pages/index.trig', import.meta.url)
  const dataset = await $rdf.dataset().import(stream)
  const graph = clownface({ dataset })

  console.log(`Loaded pages ${graph.has(rdf.type, schema.WebPage).values}`)

  return graph
})

export async function render({ req }: { req: express.Request }) {
  const path = req.originalUrl.substring(1)
  const page = req.absoluteUrl()

  const resource = await resourceHead(path)
  if (!resource) {
    return undefined
  }

  const allPages = await loadShapes()
  let dataset = findShape(allPages, resource)
  if (!dataset) {
    return undefined
  }

  const pointer = clownface({ dataset }).namedNode(page)
  let queryPath = pointer.out(ex.query).value

  if (queryPath) {
    queryPath = `../pages${url.fileURLToPath(queryPath)}`
    console.log(`Loading query from ${queryPath}`)
    await dataset.import(await loadResource(queryPath))
  }

  dataset = dataset.map(rewriteBase)
  console.log(`Page dataset ${turtle`${dataset}`.toString()}`)
  return roadshow.render({
    pointer: clownface({ dataset }).namedNode(page),
  })
}

async function resourceHead(path: string) {
  const term = $rdf.namedNode(`https://new.wikibus.org/${path}`)
  const stream = await CONSTRUCT.WHERE`${term} a ?type`.execute(sparql.query)
  const dataset = await $rdf.dataset().import(stream)
  if (!dataset.size) {
    return null
  }

  return clownface({ dataset }).namedNode(term)
}

function findShape(graph: AnyPointer<AnyContext, DatasetExt>, resource: GraphPointer) {
  const pageWithMainEntity = graph.has(schema.mainEntity, resource)
  if (isGraphPointer.isGraphPointer(pageWithMainEntity)) {
    console.log(`Loading page ${pageWithMainEntity}`)
    return graph.dataset
      .match(null, null, null, pageWithMainEntity.term)
      .map(({ subject, predicate, object }) => $rdf.quad(subject, predicate, object))
  }

  console.warn(`Page not found for <${resource.value}>`)
  return null
}

async function loadResource(path: string) {
  const query = await readFile(join(__dirname, path))

  return sparql.query.construct(query.toString())
}

function rewriteBase({ subject, predicate, object }: Quad) {
  return $rdf.quad(rewriteTerm(subject), predicate, rewriteTerm(object))
}

function rewriteTerm<T extends Term>(term: T): T {
  if (term.termType === 'NamedNode') {
    return <any>$rdf.namedNode(term.value.replace('https://new.wikibus.org', ''))
  }

  return term
}
