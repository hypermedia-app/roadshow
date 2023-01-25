import { DataFactory, NamedNode, Quad } from 'rdf-js'
import clownface, { GraphPointer } from 'clownface'
import * as $rdf from '@rdf-esm/dataset'

declare interface QuadArrayFactory {
  (factory: DataFactory): Quad[]
}

interface DynamicallyImported {
  default: QuadArrayFactory
}

export function runFactory(arg: QuadArrayFactory | DynamicallyImported): GraphPointer<NamedNode> {
  const factory = 'default' in arg ? arg.default : arg

  const dataset = $rdf.dataset(factory($rdf))

  return clownface({ dataset }).namedNode('')
}
