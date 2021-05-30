import { Directive, PartInfo, PartType } from 'lit/directive.js'
import type { NodeShape } from '@rdfine/shacl'
import type { GraphPointer } from 'clownface'
import type { Roadshow, Viewer, ViewParams } from './index'

type SuitableViewerResult = [
  Pick<Viewer, 'render' | 'viewer'> & { score: number | null },
  NodeShape | undefined
]

function suitableViewer(resource: GraphPointer) {
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

export abstract class RoadshowDirective extends Directive {
  abstract get shapes(): NodeShape[]
  abstract get viewers(): Viewer[]
  abstract get roadshow(): Roadshow

  constructor(partInfo: PartInfo) {
    super(partInfo)
    if (partInfo.type !== PartType.CHILD) {
      throw new Error('show directive can only be used in content bindings')
    }
  }

  render({ resource, shape: preferredShape }: ViewParams): unknown {
    if (!resource) {
      return ''
    }

    const found = [preferredShape, ...this.roadshow.findShapes({ resource })]
    const pairs: [Viewer, NodeShape | undefined][] = found.length
      ? cartesian(this.viewers, found)
      : this.viewers.map(v => [v])
    const [viewer, shape] = pairs
      .map(suitableViewer(resource))
      .filter(([{ score }]) => score)
      .sort(byScore)[0] || []

    if (viewer) {
      return viewer.render(this.roadshow, resource, shape)
    }

    return resource?.value || ''
  }
}
