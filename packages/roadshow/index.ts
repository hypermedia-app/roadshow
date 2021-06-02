import { TemplateResult } from 'lit'
import { directive } from 'lit/async-directive.js'
import type { GraphPointer } from 'clownface'
import { BlankNode, NamedNode } from 'rdf-js'
import { NodeShape } from '@rdfine/shacl'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { NodeShapeMixinEx, PropertyShapeMixinEx } from '@rdfine/dash/extensions/sh'
import RdfResource from '@tpluscode/rdfine'
import { NodeShapeBundle, PropertyShapeBundle } from '@rdfine/shacl/bundles'
import { RoadshowDirective } from './RoadshowDirective'
import { suitableShape } from './libs/shape'

RdfResource.factory.addMixin(...NodeShapeBundle, ...PropertyShapeBundle)
RdfResource.factory.addMixin(NodeShapeMixinEx, PropertyShapeMixinEx)

type Resource = GraphPointer | undefined | null

export interface ViewParams {
  resource: Resource | Promise<Resource>
  shape?: NodeShape
}

export interface Roadshow {
  show(arg: ViewParams): any
  findShapes(arg: { resource: GraphPointer }): NodeShape[]
  shapes: ReadonlyArray<NodeShape>
}

export interface Viewer {
  viewer?: NamedNode | BlankNode
  render(roadshow: Roadshow, resource: GraphPointer, shape: NodeShape | undefined): TemplateResult
  match(arg: {resource: GraphPointer; shape: NodeShape | undefined}): number | null
}

interface RoadshowInit {
  shapes: GraphPointer[]
  viewers: Viewer[]
  load?(id: NamedNode): Promise<GraphPointer<NamedNode>>
}

export default ({ viewers, ...init }: RoadshowInit): Roadshow => {
  const shapes = init.shapes
    .map((ptr: any) => fromPointer(ptr))

  const roadshow: Roadshow = {
    get shapes() {
      return shapes
    },
    show: directive(class extends RoadshowDirective {
      get shapes() {
        return shapes
      }

      get viewers() {
        return viewers
      }

      get roadshow() {
        return roadshow
      }
    }),
    findShapes({ resource }) {
      return shapes.filter(suitableShape(resource))
    },
  }

  return roadshow
}
