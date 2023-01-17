/* eslint-disable @typescript-eslint/no-empty-interface */
import type { GraphPointer, MultiPointer } from 'clownface'
import { TemplateResult } from 'lit'
import { NodeShape, PropertyShape } from '@rdfine/shacl'
import { NamedNode } from '@rdfjs/types'
import type { RoadshowController } from '../../RoadshowController.js'
import type { FocusNodeState, ObjectState, PropertyState } from '../state.js'
import type { Renderer } from '../render.js'

export interface Params extends Record<string, any> {
  language: string
}

export interface ViewContext<S, P = any> {
  type: 'focusNode' | 'property' | 'object'
  isFocusNode: boolean
  depth: number
  node: MultiPointer
  state: S
  readonly parent: Readonly<P> | undefined
  params: Params
  controller: RoadshowController
  setRenderer(renderer: Renderer<any>): void
}

export interface Show {
  property: PropertyState | PropertyShape | NamedNode
  viewer?: NamedNode
}

export interface ObjectViewContext<R = unknown> extends ViewContext<ObjectState<R>, PropertyState> {
  type: 'object'
  isFocusNode: false
}

export interface FocusNodeViewContext<R = unknown> extends ViewContext<FocusNodeState<R>, PropertyState> {
  type: 'object' | 'focusNode'
  isFocusNode: true
  show(params: Show): unknown
  setShape(shape: NodeShape): void
}

export interface PropertyViewContext<R = unknown> extends ViewContext<PropertyState<R>, FocusNodeState> {
  type: 'property'
  isFocusNode: false
  object(object: GraphPointer, render?: {
    literal?(this: ViewContext<ObjectState>, content: TemplateResult | string): TemplateResult | string
    resource?(this: FocusNodeViewContext): TemplateResult | string
  }): TemplateResult | string
}
