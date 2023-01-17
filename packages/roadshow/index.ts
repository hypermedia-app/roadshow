import type { ReactiveControllerHost } from 'lit'
import type { GraphPointer } from 'clownface'
import type { BlankNode, NamedNode, Term } from '@rdfjs/types'
import type { ShapesLoader } from './ShapesController.js'
import type { ResourceLoader } from './ResourcesController.js'
import type { PropertyViewContext, ViewContext } from './lib/ViewContext/index.js'
import type { Decorator } from './lib/decorator.js'
import { RenderFunc } from './lib/render.js'
import './lib/rdfine.js'

export { html, css } from 'lit'

export type { Decorator } from './lib/decorator.js'
export type { RenderFunc } from './lib/render.js'
export type { FocusNodeViewContext, PropertyViewContext, ObjectViewContext } from './lib/ViewContext/index.js'

export interface Renderer<VC extends ViewContext<any> = ViewContext<any>> {
  id?: NamedNode
  meta?(ptr: GraphPointer): void
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
  decorators: Decorator[] | undefined
  viewers: ViewerMatcher[]
  resourceLoader?: ResourceLoader
  shapesLoader?: ShapesLoader
  params: any
}

export interface Viewer {
  pointer: GraphPointer<NamedNode>
  match: ViewerMatchFunc
}
