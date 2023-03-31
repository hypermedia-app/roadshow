import clownface, { GraphPointer, AnyPointer } from 'clownface'
import $rdf from '@rdfjs/dataset'
import { BlankNode, NamedNode } from 'rdf-js'

export function blankNode(graph: AnyPointer = clownface({ dataset: $rdf.dataset() })): GraphPointer<BlankNode> {
  return graph.blankNode()
}

export function namedNode(id: string | NamedNode, graph: AnyPointer = clownface({ dataset: $rdf.dataset() })): GraphPointer<NamedNode> {
  return graph.namedNode(id)
}
