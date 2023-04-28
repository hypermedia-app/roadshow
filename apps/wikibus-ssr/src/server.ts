/* eslint-disable no-console */
import * as roadshow from '@hydrofoil/roadshow-ssr'
import './viewers.js'
import express from 'express'
import $rdf from 'rdf-ext'
import clownface, { GraphPointer } from 'clownface'
import onetime from 'onetime'
import { owl, rdf, sh } from '@tpluscode/rdf-ns-builders'
import { isResource } from 'is-graph-pointer'
import type DatasetExt from 'rdf-ext/lib/Dataset'
import { Term, NamedNode, Quad } from 'rdf-js'
import { constructQuery } from '@hydrofoil/shape-to-query'
import TermSet from '@rdfjs/term-set'
import addAll from 'rdf-dataset-ext/addAll.js'
import { n3reasoner } from 'eyereasoner'
import { turtle } from '@tpluscode/rdf-string'
import fs from 'fs/promises'
import log from 'loglevel'
import sparql from './sparql.js'
import { ex } from './ns.js'
import load from './store.js'

log.enableAll()

const loadRules = onetime(() => fs.readFile(new URL('../pages/rules.n3', import.meta.url)))

export async function render({ req }: { req: express.Request }) {
  const path = req.originalUrl.substring(1, req.originalUrl.indexOf('?'))

  const resource = $rdf.namedNode(`http://localhost:3000/${path}`)

  const shape = await findShape(resource)
  if (!shape) {
    return undefined
  }

  await prepareShape(shape, req)

  const target = shape.out(sh.targetNode).term
  let dataset = await shape.dataset.import(await constructQuery(shape).execute(sparql.query, {
    operation: 'postDirect',
  }))
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

async function prepareShape(shape: GraphPointer | null, req: express.Request) {
  if (!shape) return

  const params = requestParams(req)
  console.log('params', turtle`${params}`.toString())

  const rules = await loadRules()
  const dataset = $rdf.dataset(await n3reasoner([...shape.dataset, ...params], rules.toString(), {
    outputType: 'quads',
  }))

  const changes = clownface({ dataset }).has(ex.param)

  console.log('changes', turtle`${changes.dataset}`.toString())

  for (const change of changes.toArray()) {
    shape.any()
      .has(ex.param, change.out(ex.param))
      .deleteOut(change.out(rdf.predicate))
      .addOut(change.out(rdf.predicate), change.out(rdf.object))
  }
}

function requestParams(req: express.Request) {
  const sub = $rdf.blankNode()
  return Object.entries(req.query).flatMap(([key, value]) => [
    $rdf.quad(sub, ex.param, $rdf.literal(key)),
    $rdf.quad(sub, ex.value, $rdf.literal(value)),
  ])
}

async function findShape(term: NamedNode): Promise<GraphPointer<Term, DatasetExt> | null> {
  const graph = clownface({
    dataset: await load(term),
  })
  const shape = graph.has(sh.targetNode)
  if (isResource(shape)) {
    return withImports(shape)
  }

  console.warn(`Page not found <${term.value}>`)
  return null
}

async function withImports<G extends GraphPointer>(ptr: G): Promise<G> {
  const imported = new TermSet()
  const queue = ptr.any().has(owl.imports).out(owl.imports).terms.splice(0)

  while (queue.length) {
    const current = queue.pop()
    if (current && !imported.has(current)) {
      const imported = await load(current)
      for (const { object } of imported.match(null, owl.imports)) {
        queue.push(object)
      }
      addAll(ptr.dataset, imported)
    }
  }

  return ptr
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
