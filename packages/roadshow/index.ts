import type { ReactiveControllerHost, TemplateResult } from 'lit'
import type { GraphPointer } from 'clownface'
import type { BlankNode, NamedNode } from 'rdf-js'
import type { NodeShape, PropertyShape } from '@rdfine/shacl'
import { NodeShapeMixinEx, PropertyShapeMixinEx } from '@rdfine/dash/extensions/sh'
import RdfResource from '@tpluscode/rdfine'
import { NodeShapeBundle, PropertyShapeBundle } from '@rdfine/shacl/bundles'
import type { ShapesController } from './ShapesController'
import type { ViewersController } from './ViewersController'
import type { RenderersController } from './RenderersController'
import type { ResourceLoader } from './ResourcesController'

export interface RenderContext<T = unknown> {
  shapes: ShapesController
  viewers: ViewersController
  renderers: RenderersController
  show(params: { resource: GraphPointer; shape?: NodeShape; property?: PropertyShape }): unknown
  params: T
}

export interface Renderer<T = unknown> {
  viewer: NamedNode
  render(this: RenderContext<T>, resource: GraphPointer, shape: NodeShape): TemplateResult | string
}

export interface ViewerMatch {
  ({ resource }: { resource: GraphPointer }): number | null
}

export interface ViewerMatchInit {
  viewer: NamedNode
  match: ViewerMatch
}

export interface RoadshowView extends ReactiveControllerHost {
  resource: GraphPointer<NamedNode | BlankNode> | undefined
  resourceId: NamedNode | undefined
  shapes: NodeShape[]
  renderers: Renderer[]
  viewers: ViewerMatchInit[]
  resourceLoader?: ResourceLoader
  params: any
}

RdfResource.factory.addMixin(...NodeShapeBundle, ...PropertyShapeBundle)
RdfResource.factory.addMixin(NodeShapeMixinEx, PropertyShapeMixinEx)

export interface Viewer {
  pointer: GraphPointer<NamedNode>
  match: ViewerMatch
}
