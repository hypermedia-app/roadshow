import type { ReactiveControllerHost, TemplateResult } from 'lit'
import type { GraphPointer, MultiPointer } from 'clownface'
import type { NamedNode, Term } from '@rdfjs/types'
import type { ShapesLoader } from './ShapesController'
import type { ResourceLoader } from './ResourcesController'
import type { PropertyViewContext, ViewContext } from './lib/ViewContext'

export { html, css } from 'lit'

export interface RenderFunc<S extends ViewContext<unknown>> {
  (this: S, resource: MultiPointer): TemplateResult | string
}

export interface Renderer<S extends ViewContext<any> = ViewContext<any>> {
  viewer: Term
  render: RenderFunc<S>
}

export type MultiRenderer = Renderer<PropertyViewContext>

export interface ViewerMatchFunc {
  (arg: { resource: GraphPointer }): number | null
}

export interface ViewerMatcher {
  viewer: NamedNode
  match: ViewerMatchFunc
}

export interface RoadshowView extends ReactiveControllerHost {
  resource: MultiPointer | undefined
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
