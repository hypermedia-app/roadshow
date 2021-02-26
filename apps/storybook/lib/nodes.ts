import clownface, { GraphPointer, AnyPointer } from 'clownface'
import { dataset } from '@rdf-esm/dataset'
import { BlankNode, NamedNode } from 'rdf-js'

export function blankNode(graph: AnyPointer = clownface({ dataset: dataset() })): GraphPointer<BlankNode> {
  return graph.blankNode()
}

export function namedNode(id: string | NamedNode, graph: AnyPointer = clownface({ dataset: dataset() })): GraphPointer<NamedNode> {
  return graph.namedNode(id)
}
