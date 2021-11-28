import type { ReactiveControllerHost, TemplateResult } from 'lit'
import type { GraphPointer, MultiPointer } from 'clownface'
import type { BlankNode, NamedNode, Term } from '@rdfjs/types'
import type { ShapesLoader } from './ShapesController'
import type { ResourceLoader } from './ResourcesController'
import type { FocusNodeViewContext, ObjectViewContext, PropertyViewContext, ViewContext } from './lib/ViewContext'
import type { FocusNodeState, ObjectState, PropertyState } from './lib/state'
import './lib/rdfine'

export { html, css } from 'lit'

export interface RenderFunc<S extends ViewContext<unknown>> {
  (this: S, resource: MultiPointer): TemplateResult | string
}

export interface Renderer<VC extends ViewContext<any> = ViewContext<any>> {
  viewer: Term
  render: RenderFunc<VC>
  init?: () => Promise<void>
}

export type MultiRenderer = Renderer<PropertyViewContext>

export interface ViewerMatchFunc {
  (arg: { resource: GraphPointer }): number | null
}

export interface ViewerMatcher {
  viewer: NamedNode
  match: ViewerMatchFunc
}

export interface RoadshowView extends ReactiveControllerHost, EventTarget {
  resource: GraphPointer<NamedNode | BlankNode> | undefined
  resourceId: NamedNode | undefined
  renderers: Renderer[]
  viewers: ViewerMatcher[]
  resourceLoader?: ResourceLoader
  shapesLoader?: ShapesLoader
  params: any
}

export interface Viewer {
  pointer: GraphPointer<NamedNode>
  match: ViewerMatchFunc
}

interface Decorator<S, VC extends ViewContext<S>> {
  appliesTo(state: S): boolean
  init?: () => Promise<void>
  render(render: () => ReturnType<RenderFunc<VC>>): RenderFunc<VC>
}

export type FocusNodeDecorator = Decorator<FocusNodeState, FocusNodeViewContext>
export type ObjectDecorator = Decorator<ObjectState, ObjectViewContext>
export type PropertyDecorator = Decorator<PropertyState, PropertyViewContext>

export interface Decorators {
  focusNode?: Array<FocusNodeDecorator>
  property?: Array<PropertyDecorator>
  object?: Array<ObjectDecorator>
}
