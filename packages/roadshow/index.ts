import { directive, NodePart, TemplateResult } from 'lit-html'
import type { GraphPointer } from 'clownface'
import { BlankNode, NamedNode } from 'rdf-js'
import { dash, rdf, rdfs, sh } from '@tpluscode/rdf-ns-builders'
import { NodeShape } from '@rdfine/shacl'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { NodeShapeMixinEx, PropertyShapeMixinEx } from '@rdfine/dash/extensions/sh'
import RdfResource from '@tpluscode/rdfine'
import { NodeShapeBundle, PropertyShapeBundle } from '@rdfine/shacl/bundles'

RdfResource.factory.addMixin(...NodeShapeBundle, ...PropertyShapeBundle)
RdfResource.factory.addMixin(NodeShapeMixinEx, PropertyShapeMixinEx)

interface ViewParams {
  resource: GraphPointer | undefined
  shape?: NodeShape
}

export interface Roadshow {
  show(arg: ViewParams): any
  findShape(arg: { resource: GraphPointer }): NodeShape
  shapes: ReadonlyArray<NodeShape>
}

export interface Viewer {
  viewer?: NamedNode | BlankNode
  render(roadshow: Roadshow, resource: GraphPointer, shape: NodeShape | undefined): TemplateResult
  match(arg: {resource: GraphPointer | undefined; shape: NodeShape | undefined}): number | null
}

interface RoadshowInit {
  shapes: GraphPointer[]
  viewers: Viewer[]
}

function suitableShape(resource: GraphPointer | undefined) {
  return (shape: NodeShape) => {
    const types = resource?.out(rdf.type).toArray() || []

    const hasTargetClass = shape.pointer.has(sh.targetClass, types).terms.length > 0
    const s1 = shape.pointer.has(rdf.type, [rdfs.Class, sh.NodeShape])

    const hasImplicitTarget = s1.terms.length > 0 && types.some(type => type.term.equals(shape.id))
    const applicable = shape.pointer.has(dash.applicableToClass, types).terms.length > 0

    return hasTargetClass || hasImplicitTarget || applicable
  }
}

type SuitableViewerResult = [
  Pick<Viewer, 'render' | 'viewer'> & { score: number | null },
  NodeShape | undefined
]

function suitableViewer(resource: GraphPointer | undefined) {
  return ([{ viewer, render, match }, shape]: [Viewer, NodeShape | undefined]): SuitableViewerResult => ([{
    render,
    viewer,
    score: match({ resource, shape }),
  }, shape])
}

function byScore([left]: SuitableViewerResult, [right]: SuitableViewerResult): number {
  const leftScore = left.score || 0
  const rightScore = right.score || 0

  return rightScore - leftScore
}

const cartesian =
  (...a: any[]) => a.reduce((a, b) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())))

export default ({ viewers, ...init }: RoadshowInit): Roadshow => {
  const shapes = init.shapes
    .map((ptr: any) => fromPointer(ptr))

  const roadshow: Roadshow = {
    get shapes() {
      return shapes
    },
    show: directive(({ resource, shape: overrideShape }: ViewParams) => (part: NodePart | unknown) => {
      if (!(part instanceof NodePart)) {
        throw new Error('show directive can only be used in content bindings')
      }

      if (!resource) {
        part.setValue('')
        return
      }

      const found = shapes.filter(suitableShape(resource))
      const pairs: [Viewer, NodeShape | undefined][] = found.length
        ? cartesian(viewers, found)
        : viewers.map(v => [v])
      const [viewer, shape] = pairs
        .map(suitableViewer(resource))
        .filter(([{ score }]) => score)
        .sort(byScore)[0] || []

      if (viewer) {
        part.setValue(viewer.render(roadshow, resource, overrideShape || shape))
      } else {
        part.setValue(resource?.value || '')
      }
    }),
    findShape({ resource }) {
      return shapes.filter(suitableShape(resource))[0]
    },
  }

  return roadshow
}
