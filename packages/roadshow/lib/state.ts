/* eslint-disable no-use-before-define */
import type { NodeShape, PropertyShape } from '@rdfine/shacl'
import type { BlankNode, Literal, NamedNode } from '@rdfjs/types'
import type { GraphPointer, MultiPointer } from 'clownface'
import type { TemplateResult } from 'lit'
import type { ViewerScore } from '../ViewersController'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LocalState {

}

export interface CoreState<T extends any = any> {
  pointer: T
  applicableViewers: ViewerScore[]
  viewer?: GraphPointer<NamedNode>
  render?(): TemplateResult | string
  locals: LocalState
}

export interface PropertyViewState extends CoreState<never> {
  shape?: PropertyShape
  objects: Record<string, ViewState>
  path?: MultiPointer
}

export type LiteralViewState = CoreState<GraphPointer<Literal>>

export interface ResourceViewState extends CoreState<GraphPointer<BlankNode | NamedNode>> {
  shape?: NodeShape
  applicableShapes: NodeShape[]
  properties: Partial<Record<string, PropertyViewState>>
}

export type ViewState = LiteralViewState | ResourceViewState
