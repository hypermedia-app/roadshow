/* eslint-disable no-console */
import * as roadshow from '@hydrofoil/roadshow-ssr'
import './viewers.js'
import express from 'express'
import $rdf from 'rdf-ext'
import { loadData } from 'test-data'
import clownface, { AnyContext, AnyPointer, GraphPointer } from 'clownface'
import onetime from 'onetime'
import { rdf, schema, sh } from '@tpluscode/rdf-ns-builders'
import { isGraphPointer } from 'is-graph-pointer'
import type DatasetExt from 'rdf-ext/lib/Dataset'
import { Term, NamedNode, Quad } from 'rdf-js'
import { constructQuery } from '@hydrofoil/shape-to-query'
import sparql from './sparql.js'

const loadPages = onetime(async () => {
  const stream = <any>loadData('../pages/index.trig', import.meta.url)
  const dataset = await $rdf.dataset().import(stream)
  const graph = clownface({ dataset })

  console.log(`Loaded pages ${graph.has(rdf.type, schema.WebPage).values}`)

  return graph
})

export async function render({ req }: { req: express.Request }) {
  const path = req.originalUrl.substring(1)

  const resource = $rdf.namedNode(`http://localhost:3000/${path}`)

  const allPages = await loadPages()
  const shape = findShape(allPages, resource)
  if (!shape) {
    return undefined
  }

  const target = shape.out(sh.targetNode).term
  let dataset = await shape.dataset.import(await constructQuery(shape).execute(sparql.query))
  dataset = dataset.map(({ subject, predicate, object, graph }) => $rdf.quad(
    subject.equals(target) ? resource : subject,
    predicate,
    object.equals(target) ? resource : object,
    graph,
  )).map(rewriteBase)

  const pointer = clownface({ dataset }).namedNode(resource)
  console.log(`Rendering ${pointer.value}`)
  return roadshow.render({
    pointer,
  })
}

function findShape(allpages: AnyPointer<AnyContext, DatasetExt>, term: NamedNode): GraphPointer<Term, DatasetExt> | null {
  const graph = clownface({
    dataset: allpages.dataset.match(null, null, null, term),
  })
  const shape = graph.has(sh.targetNode)
  if (isGraphPointer(shape)) {
    return shape as any
  }

  console.warn(`Page not found <${term.value}>`)
  return null
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
