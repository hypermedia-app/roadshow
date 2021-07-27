/* eslint-disable no-use-before-define */
import type { NodeShape, PropertyShape } from '@rdfine/shacl'
import type { BlankNode, Literal, NamedNode } from '@rdfjs/types'
import type { GraphPointer, MultiPointer } from 'clownface'
import type { TemplateResult } from 'lit'
import type { ViewerScore } from '../ViewersController'

export interface CoreState<T extends any = any> {
  pointer: T
  applicableViewers: ViewerScore[]
  viewer?: GraphPointer<NamedNode>
  render?(): TemplateResult | string
}

export interface PropertyViewState extends CoreState<never> {
  shape?: PropertyShape
  objects: Record<string, ViewState>
  path?: MultiPointer
}

export type LiteralViewState = CoreState<GraphPointer<Literal>>

export interface NodeViewState extends CoreState<GraphPointer<BlankNode | NamedNode>> {
  shape?: NodeShape
  applicableShapes: NodeShape[]
  properties: Partial<Record<string, PropertyViewState>>
}

export type ViewState = LiteralViewState | NodeViewState
