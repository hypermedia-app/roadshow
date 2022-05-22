/* eslint-disable @typescript-eslint/no-empty-interface */
import type { GraphPointer, MultiPointer } from 'clownface'
import { TemplateResult } from 'lit'
import { NodeShape, PropertyShape } from '@rdfine/shacl'
import { NamedNode } from '@rdfjs/types'
import type { RoadshowController } from '../../RoadshowController'
import type { FocusNodeState, ObjectState, PropertyState } from '../state'
import type { Renderer } from '../render'

export interface Params extends Record<string, any> {
  language: string
}

export interface ViewContext<S, P = any> {
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

export interface FocusNodeViewContext<R = unknown> extends ViewContext<FocusNodeState<R>, PropertyState> {
  show(params: Show): unknown
  setShape(shape: NodeShape): void
}

export interface PropertyViewContext<R = unknown> extends ViewContext<PropertyState<R>, FocusNodeState> {
  object(object: GraphPointer, render?: {
    literal?(this: ViewContext<ObjectState>, content: TemplateResult | string): TemplateResult | string
    resource?(this: FocusNodeViewContext): TemplateResult | string
  }): TemplateResult | string
}

export interface ObjectViewContext<R = unknown> extends ViewContext<ObjectState<R>, PropertyState> {

}
