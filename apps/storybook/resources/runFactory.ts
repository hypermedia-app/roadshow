import { DataFactory, NamedNode, Quad } from 'rdf-js'
import clownface, { GraphPointer } from 'clownface'
import * as $rdf from '@rdf-esm/dataset'

declare interface QuadArrayFactory {
  (factory: DataFactory): Quad[]
}
export function runFactory(factory: QuadArrayFactory): GraphPointer<NamedNode> {
  const dataset = $rdf.dataset(factory($rdf))

  return clownface({ dataset }).namedNode('')
}
