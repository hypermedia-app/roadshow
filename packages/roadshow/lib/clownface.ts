import { GraphPointer, MultiPointer } from 'clownface'
import type { BlankNode, Literal, NamedNode } from '@rdfjs/types'
import { xsd } from '@tpluscode/rdf-ns-builders/strict'
import { literal } from '@rdf-esm/dataset'

export const TRUE = literal('true', xsd.boolean)

export function isGraphPointer(ptr: MultiPointer): ptr is GraphPointer {
  return !!ptr.term
}

export function isLiteral(ptr: GraphPointer): ptr is GraphPointer<Literal> {
  return ptr.term.termType === 'Literal'
}

export function isResource(ptr: GraphPointer): ptr is GraphPointer<BlankNode | NamedNode> {
  return ptr.term.termType === 'BlankNode' || ptr.term.termType === 'NamedNode'
}
