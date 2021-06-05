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

export interface RenderContext {
  shapes: ShapesController
  viewers: ViewersController
  renderers: RenderersController
  show(params: { resource: GraphPointer; shape?: NodeShape; property?: PropertyShape }): unknown
}

export interface Renderer {
  viewer: NamedNode
  render(this: RenderContext, resource: GraphPointer, shape: NodeShape | undefined): TemplateResult | string
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
}

RdfResource.factory.addMixin(...NodeShapeBundle, ...PropertyShapeBundle)
RdfResource.factory.addMixin(NodeShapeMixinEx, PropertyShapeMixinEx)

export interface Viewer {
  pointer: GraphPointer<NamedNode>
  match: ViewerMatch
}
