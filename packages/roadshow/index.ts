import type { ReactiveControllerHost, TemplateResult } from 'lit'
import type { GraphPointer, MultiPointer } from 'clownface'
import type { BlankNode, NamedNode, Term } from '@rdfjs/types'
import type { NodeShape, PropertyShape } from '@rdfine/shacl'
import type { ShapesController, ShapesLoader } from './ShapesController'
import type { ViewerScore, ViewersController } from './ViewersController'
import type { RenderersController } from './RenderersController'
import type { ResourceLoader, ResourcesController } from './ResourcesController'
import type { PropertyViewState, ViewState } from './lib/state'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LocalState {

}

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

export interface RenderContext<S, T = unknown> {
  initRenderer(overrides: InitRenderer): void
  depth: number
  parent?: RenderContext<any, T>
  state: S
  locals: LocalState
  shapes: ShapesController
  viewers: ViewersController
  renderers: RenderersController
  resources: ResourcesController
  show(params: Show): unknown
  requestUpdate(): void
  params: T
  render?(): unknown
  findApplicableViewers(ptr: GraphPointer): ViewerScore[]
}

export interface Renderer<S extends ViewState = ViewState, T = unknown> {
  viewer: NamedNode
  render(this: RenderContext<S, T>, resource: GraphPointer, shape?: NodeShape): TemplateResult | string
}

export interface MultiRenderer<T = unknown> {
  viewer: NamedNode
  render(this: RenderContext<PropertyViewState, T>, resources: MultiPointer): TemplateResult | string
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
