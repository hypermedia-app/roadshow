import type { ReactiveControllerHost, TemplateResult } from 'lit'
import type { GraphPointer, MultiPointer } from 'clownface'
import type { BlankNode, NamedNode, Term } from '@rdfjs/types'
import type { NodeShape, PropertyShape } from '@rdfine/shacl'
import type { ShapesLoader } from './ShapesController'
import type { ResourceLoader } from './ResourcesController'
import type { PropertyViewState, ViewState } from './lib/state'
import type { ViewContext } from './lib/ViewContext'

export interface Show {
  resource: MultiPointer
  shape?: NodeShape
  property: PropertyShape | NamedNode
  viewer?: Term
}

export interface InitRenderer {
  viewer?: Term
  shape?: NodeShape
  property: PropertyShape | NamedNode
}

export interface Renderer<S extends ViewState = ViewState, T = unknown> {
  viewer: NamedNode
  render(this: ViewContext<S, T>, resource: GraphPointer, shape?: NodeShape): TemplateResult | string
}

export interface MultiRenderer<T = unknown> {
  viewer: NamedNode
  render(this: ViewContext<PropertyViewState, T>, resources: MultiPointer): TemplateResult | string
}

export interface ViewerMatch {
  (arg: { resource: GraphPointer }): number | null
}

export interface MultiViewerMatch {
  (arg: { resources: MultiPointer; state: PropertyViewState }): number | null
}

export interface ViewerMatchInit {
  viewer: NamedNode
  match?: ViewerMatch
  matchMulti?: MultiViewerMatch
}

export interface RoadshowView extends ReactiveControllerHost {
  resource: GraphPointer<NamedNode | BlankNode> | undefined
  resourceId: NamedNode | undefined
  shapes: NodeShape[]
  renderers: Renderer[]
  viewers: ViewerMatchInit[]
  resourceLoader?: ResourceLoader
  shapesLoader?: ShapesLoader
  params: any
}

export interface Viewer {
  pointer: GraphPointer<NamedNode>
  match?: ViewerMatch
  matchMulti?: MultiViewerMatch
}
