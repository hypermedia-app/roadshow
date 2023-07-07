import { DataFactory, NamedNode, Quad } from 'rdf-js'
import clownface, { GraphPointer } from 'clownface'
import dataModel from '@rdfjs/data-model'
import $rdf from '@rdfjs/dataset'

declare interface QuadArrayFactory {
  (arg: { factory: DataFactory }): Quad[]
}

interface DynamicallyImported {
  default: QuadArrayFactory
}

export function runFactory(arg: QuadArrayFactory | DynamicallyImported): GraphPointer<NamedNode> {
  const createQuads = 'default' in arg ? arg.default : arg

  const dataset = $rdf.dataset(createQuads({ factory: dataModel }))

  return clownface({ dataset }).namedNode('')
}
