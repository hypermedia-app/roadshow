import { ReactiveController } from 'lit'
import type { GraphPointer } from 'clownface'
import TermMap from '@rdf-esm/term-map'
import { NamedNode, Term } from '@rdfjs/types'
import clownface, { AnyPointer } from 'clownface'
import { dataset } from '@rdf-esm/dataset'
import { RoadshowView, Viewer, ViewerMatchInit } from './index'
import * as defaultViewers from './viewers'

export interface ViewerScore {
  pointer: GraphPointer<NamedNode>
  score: number | null
}

function suitableViewers(resource: GraphPointer) {
  return (matched: ViewerScore[], { pointer, match }: Viewer): ViewerScore[] => {
    const score = match({ resource })
    if (score === 0) {
      return matched
    }

    return [...matched, {
      pointer,
      score,
    }]
  }
}

function byScore(left: ViewerScore, right: ViewerScore) {
  return (right.score || -1) - (left.score || -1)
}

export class ViewersController implements ReactiveController {
  static readonly defaultViewers: Array<ViewerMatchInit> = Object.values(defaultViewers)
  static readonly viewerMeta: AnyPointer = clownface({ dataset: dataset() })

  viewers: Map<NamedNode, Viewer>

  constructor(private host: RoadshowView) {
    this.viewers = new TermMap()
  }

  hostConnected(): void {
    const mapInit = [
      ...ViewersController.defaultViewers,
      ...this.host.viewers,
    ].map<[NamedNode, Viewer]>(({ viewer, match }) => {
      const impl = {
        pointer: ViewersController.viewerMeta.node(viewer),
        match,
      }
      return [viewer, impl]
    })

    this.viewers = new TermMap(mapInit)
  }

  findApplicableViewers(object: GraphPointer): ViewerScore[] {
    return [...this.viewers.values()]
      .reduce(suitableViewers(object), [])
      .sort(byScore)
  }

  get(viewer: Term): GraphPointer<NamedNode> {
    if (viewer.termType !== 'NamedNode') {
      throw new Error('Viewer must be an IRI')
    }

    return ViewersController.viewerMeta.node(viewer)
  }
}
