import { directive, NodePart, TemplateResult } from 'lit-html'
import clownface, { GraphPointer, AnyPointer } from 'clownface'
import { BlankNode, DatasetCore, NamedNode } from 'rdf-js'
import { dataset } from '@rdf-esm/dataset'
import { rdf, sh } from '@tpluscode/rdf-ns-builders'
import { NodeShape } from '@rdfine/shacl'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { NodeShapeMixinEx, PropertyShapeMixinEx } from '@rdfine/dash/extensions/sh'
import RdfResource from '@tpluscode/rdfine'

RdfResource.factory.addMixin(NodeShapeMixinEx, PropertyShapeMixinEx)

// const stateMap = new WeakMap()

interface ViewParams {
  resource: GraphPointer
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
  match(arg: {resource: GraphPointer; shape: NodeShape | undefined}): number | null
}

interface RoadshowInit {
  shapes: AnyPointer[]
  viewers: Viewer[]
}

function suitableShape(resource: GraphPointer) {
  return (shape: NodeShape) => shape.pointer.has(sh.targetClass, resource.out(rdf.type)).terms.length > 0
}

function combineDatasets(combined: DatasetCore, shape: AnyPointer) {
  for (const dataset of shape.datasets) {
    for (const quad of dataset) {
      combined.add(quad)
    }
  }
  return combined
}

function suitableViewer(resource: GraphPointer, shape: NodeShape | undefined) {
  return ({ viewer, render, match }: Viewer): Pick<Viewer, 'render' | 'viewer'> & { score: number | null } => ({
    render,
    viewer,
    score: match({ resource, shape }),
  })
}

function byScore(left: { score: number | null }, right: { score: number | null }): number {
  const leftScore = left.score || 0
  const rightScore = right.score || 0

  return rightScore - leftScore
}

export default ({ viewers, ...init }: RoadshowInit): Roadshow => {
  const shapes = clownface({ dataset: init.shapes.reduce(combineDatasets, dataset()) })
    .has(rdf.type, sh.NodeShape)
    .map(ptr => fromPointer(ptr))

  const roadshow: Roadshow = {
    get shapes() {
      return shapes
    },
    show: directive(({ resource, shape: overrideShape }: ViewParams) => (part: NodePart | unknown) => {
      if (!(part instanceof NodePart)) {
        throw new Error('show directive can only be used in content bindings')
      }

      const [found] = shapes.filter(suitableShape(resource))
      const shape = overrideShape || found
      const [viewer] = viewers
        .map(suitableViewer(resource, shape))
        .filter(({ score }) => score)
        .sort(byScore)

      part.setValue(viewer?.render(roadshow, resource, shape) || resource.value)
    }),
    findShape({ resource }) {
      return shapes.filter(suitableShape(resource))[0]
    },
  }

  return roadshow
}
