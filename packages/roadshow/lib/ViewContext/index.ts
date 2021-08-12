/* eslint-disable @typescript-eslint/no-empty-interface */
import type { GraphPointer, MultiPointer } from 'clownface'
import { TemplateResult } from 'lit'
import { PropertyShape } from '@rdfine/shacl'
import { NamedNode } from '@rdfjs/types'
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

export interface Show {
  property: PropertyState | PropertyShape | NamedNode
}

export interface FocusNodeViewContext extends ViewContext<FocusNodeState> {
  show(params: Show): unknown
}

export interface PropertyViewContext extends ViewContext<PropertyState> {
  object(object: GraphPointer, render: {
    literal?(this: ViewContext<ObjectState>, content: TemplateResult | string): TemplateResult | string
    resource?(this: FocusNodeViewContext): TemplateResult | string
  }): TemplateResult | string
}

export interface ObjectViewContext extends ViewContext<ObjectState> {

}
