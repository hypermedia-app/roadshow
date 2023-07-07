/* eslint-disable no-console */
import express, { RequestHandler } from 'express'
import $rdf from 'rdf-ext'
import { owl, rdf, schema, sh } from '@tpluscode/rdf-ns-builders'
import { constructQuery } from '@hydrofoil/shape-to-query'
import clownface, { AnyPointer, GraphPointer } from 'clownface'
import { turtle } from '@tpluscode/rdf-string'
import { ex } from 'test-data/ns.js'
import { Quad, Term } from 'rdf-js'
import DatasetExt from 'rdf-ext/lib/Dataset.js'
import { isGraphPointer, isLiteral, isResource } from 'is-graph-pointer'
import TermSet from '@rdfjs/term-set'
import load from './store.js'
import sparql from './sparql.js'

export const loadResource: RequestHandler = async (req, res, next) => {
  let shape: GraphPointer<Term, DatasetExt> | null
  let resource: GraphPointer<Term, DatasetExt>
  const queryStart = req.originalUrl.indexOf('?')
  const path = req.originalUrl.substring(1, queryStart === -1 ? undefined : queryStart)
  const term = $rdf.namedNode(`http://localhost:3000/${path}`)

  try {
    resource = clownface({
      dataset: await load(term),
      term,
    })

    shape = await findShape(resource)
    if (!shape) {
      return res.sendStatus(404)
    }
  } catch {
    return next()
  }

  try {
    await prepareShape(shape, req)

    const target = shape.out(sh.targetNode).term
    const t0 = performance.now()
    const query = constructQuery(shape)
    console.log(query.build())
    let dataset = await shape.dataset.import(await query
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
  } catch (e) {
    console.error(e)
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
    const param = parametrisedNode.out(ex.param)
    const defaultValue = parametrisedNode.out(sh.defaultValue)
    const subjects = shapeGraph.dataset.match(null, null, parametrisedNode.term)
    const objects = shapeGraph.dataset.match(parametrisedNode.term)
    let value: Term | undefined

    if (isLiteral(param) && param.term.datatype.equals(ex.template)) {
      value = evalTemplateLiteral(param.value, params)
    } else {
      value = params.has(ex.param, param).out(ex.value).term
    }

    console.log(`param '${param.value}'; default value ${defaultValue.values}; value: ${value}`)

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

function evalTemplateLiteral(content: string, params: AnyPointer) {
  try {
    const keys = params.has(ex.param).out(ex.param).values
    console.log(keys)

    const values = keys.map(param => params.has(ex.param, param)
      .out(ex.value).term)
    const template = Function(...keys, `return \`${content}\``) // eslint-disable-line no-new-func

    return template(...values)
  } catch (e: any) {
    console.log(e)
    return ex.error
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
