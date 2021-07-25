/* eslint-disable no-use-before-define */
import type { NodeShape, PropertyShape } from '@rdfine/shacl'
import type { BlankNode, Literal, NamedNode, Term } from '@rdfjs/types'
import type { GraphPointer } from 'clownface'
import type { TemplateResult } from 'lit'
import type { ViewerScore } from '../ViewersController'

interface CoreState<T extends Term = Term> {
  pointer: GraphPointer<T>
  applicableViewers: ViewerScore[]
  viewer?: GraphPointer<NamedNode>
  render?(): TemplateResult | string
}

export interface PropertyViewState {
  shape?: PropertyShape
  objects: Record<string, ViewState>
  path?: NamedNode
  applicableViewers: ViewerScore[]
  viewer?: GraphPointer<NamedNode>
  render?(): TemplateResult | string
}

export type LiteralViewState = CoreState<Literal>

export interface NodeViewState extends CoreState<BlankNode | NamedNode> {
  shape?: NodeShape
  applicableShapes: NodeShape[]
  properties: Record<string, PropertyViewState>
}

export type ViewState = LiteralViewState | NodeViewState

function isIri(pointer: GraphPointer): pointer is GraphPointer<NamedNode | BlankNode> {
  return pointer.term.termType === 'NamedNode' || pointer.term.termType === 'BlankNode'
}

function isLiteral(pointer: GraphPointer): pointer is GraphPointer<Literal> {
  return pointer.term.termType === 'Literal'
}

function initNodeViewState(pointer: GraphPointer<NamedNode | BlankNode>): NodeViewState {
  return {
    pointer,
    applicableViewers: [],
    applicableShapes: [],
    properties: {},
  }
}

function initLiteralViewState(pointer:GraphPointer<Literal>): LiteralViewState {
  return {
    pointer,
    applicableViewers: [],
  }
}

export function initState(pointer: GraphPointer): ViewState {
  if (isIri(pointer)) {
    return initNodeViewState(pointer)
  }

  if (isLiteral(pointer)) {
    return initLiteralViewState(pointer)
  }

  throw new Error('Rendered node must be literal, IRI or blank node')
}
