/* eslint-disable no-console */
import express, { RequestHandler } from 'express'
import $rdf from 'rdf-ext'
import { owl, rdf, schema, sh } from '@tpluscode/rdf-ns-builders'
import { constructQuery } from '@hydrofoil/shape-to-query'
import clownface, { GraphPointer } from 'clownface'
import { turtle } from '@tpluscode/rdf-string'
import { ex } from 'test-data/ns.js'
import { Quad, Term } from 'rdf-js'
import DatasetExt from 'rdf-ext/lib/Dataset'
import { isGraphPointer, isResource } from 'is-graph-pointer'
import TermSet from '@rdfjs/term-set'
import load from './store.js'
import sparql from './sparql.js'

export const loadResource: RequestHandler = async (req, res, next) => {
  try {
    const queryStart = req.originalUrl.indexOf('?')
    const path = req.originalUrl.substring(1, queryStart === -1 ? undefined : queryStart)

    const term = $rdf.namedNode(`http://localhost:3000/${path}`)
    const resource = clownface({
      dataset: await load(term),
      term,
    })

    const shape = await findShape(resource)
    if (!shape) {
      return res.sendStatus(404)
    }

    await prepareShape(shape, req)

    const target = shape.out(sh.targetNode).term
    const t0 = performance.now()
    let dataset = await shape.dataset.import(await constructQuery(shape)
      .execute(sparql.query, {
        operation: 'postDirect',
      }))
    const t1 = performance.now()
    console.log(`Query took ${t1 - t0} milliseconds.`)

    dataset = dataset.map(({
      subject,
      predicate,
      object,
      graph,
    }) => $rdf.quad(
      subject.equals(target) ? term : subject,
      predicate,
      object.equals(target) ? term : object,
      graph,
    ))
      .map(rewriteBase)

    res.locals.webPage = isGraphPointer(resource.has(rdf.type, schema.WebPage))
    res.locals.resource = clownface({ dataset })
      .node(resource)
    return next()
  } catch {
    return next()
  }
}

async function prepareShape(shape: GraphPointer | null, req: express.Request) {
  if (!shape) return

  const params = requestParams(req)
  console.log('params', turtle`${params}`.toString())

  const shapeGraph = shape.any()
  const parametrised = shapeGraph.has(ex.param)

  for (const parametrisedNode of parametrised.toArray()) {
    const param = parametrisedNode.out(ex.param).value
    const defaultValue = parametrisedNode.out(sh.defaultValue)
    const subjects = shapeGraph.dataset.match(null, null, parametrisedNode.term)
    const objects = shapeGraph.dataset.match(parametrisedNode.term)
    const value = params.has(ex.param, param).out(ex.value).term

    console.log(`param '${param}'; default value ${defaultValue.values}; value: ${value}`)

    parametrisedNode.deleteIn().deleteOut()

    for (const { subject, predicate } of subjects) {
      shapeGraph.node(subject)
        .addOut(predicate, value || defaultValue)
    }
    for (const { predicate, object } of objects) {
      if (!predicate.equals(sh.defaultValue) && !predicate.equals(ex.param)) {
        shapeGraph.node(object)
          .addIn(predicate, value || defaultValue)
      }
    }
  }
}

function requestParams(req: express.Request) {
  const sub = $rdf.blankNode()
  const quads = Object.entries(req.query).flatMap(([key, value]: any) => [
    $rdf.quad(sub, ex.param, $rdf.literal(key)),
    $rdf.quad(sub, ex.value, $rdf.literal(value)),
  ])

  return clownface({
    dataset: $rdf.dataset(quads),
  })
}

async function findShape(graph: GraphPointer<Term, DatasetExt>): Promise<GraphPointer<Term, DatasetExt> | null> {
  const shape = graph.any().has(sh.targetNode)
  if (isResource(shape)) {
    return withImports(shape)
  }

  console.warn(`Page not found <${graph.value}>`)
  return null
}

async function withImports<G extends GraphPointer>(ptr: G): Promise<G> {
  const imported = new TermSet()
  const queue = ptr.any().has(owl.imports).out(owl.imports).terms.splice(0)

  while (queue.length) {
    const current = queue.pop()
    if (current && !imported.has(current)) {
      imported.add(current)
      // eslint-disable-next-line no-await-in-loop
      const quads = await load(current)
      for (const quad of quads) {
        ptr.dataset.add(quad)
        if (quad.predicate.equals(owl.imports)) {
          queue.push(quad.object)
        }
      }
    }
  }

  return ptr
}

function rewriteBase({ subject, predicate, object }: Quad) {
  return $rdf.quad(rewriteTerm(subject), predicate, rewriteTerm(object))
}

function rewriteTerm<T extends Term>(term: T): T {
  if (term.termType === 'NamedNode') {
    return <any>$rdf.namedNode(term.value.replace('https://new.wikibus.org', 'http://localhost:3000'))
  }

  return term
}
