import RDF from '@rdfjs/dataset'
import create from 'clownface'
import { NamedNode } from '@rdfjs/types'

export function clownface(dataset = RDF.dataset()) {
  return create({ dataset })
}

export function blankNode() {
  return clownface().blankNode()
}

export function namedNode(id: string | NamedNode) {
  return clownface().namedNode(id)
}
