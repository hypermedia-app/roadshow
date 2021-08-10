/* eslint-disable @typescript-eslint/no-empty-interface */
import type { GraphPointer, MultiPointer } from 'clownface'
import { TemplateResult } from 'lit'
import type { RoadshowController } from '../../RoadshowController'
import type { FocusNodeState, ObjectState, PropertyState } from '../state'

export interface Params extends Record<string, any> {
}

export interface ViewContext<S> {
  depth: number
  node: MultiPointer
  state: S
  params: Params
  controller: RoadshowController
}

export interface FocusNodeViewContext extends ViewContext<FocusNodeState> {
  show(params: { property: PropertyState }): unknown
}

export interface PropertyViewContext extends ViewContext<PropertyState> {
  object(object: GraphPointer, render: {
    literal?(this: ViewContext<ObjectState>): TemplateResult | string
    resource?(this: FocusNodeViewContext): TemplateResult | string
  }): TemplateResult | string
}

export interface ObjectViewContext extends ViewContext<ObjectState> {

}
