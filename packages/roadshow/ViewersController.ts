import { ReactiveController } from 'lit'
import type { GraphPointer, MultiPointer } from 'clownface'
import TermMap from '@rdf-esm/term-map'
import { NamedNode, Term } from '@rdfjs/types'
import clownface, { AnyPointer } from 'clownface'
import { dataset } from '@rdf-esm/dataset'
import { RoadshowView, Viewer, ViewerMatchInit } from './index'
import * as defaultViewers from './viewers'
import { isGraphPointer } from './lib/clownface'
import { PropertyViewState } from './lib/state'

export interface ViewerScore {
  pointer: GraphPointer<NamedNode>
  score: number | null
}

function suitableViewers(resource: GraphPointer) {
  return (matched: ViewerScore[], { pointer, match }: Viewer): ViewerScore[] => {
    const score = match?.({ resource }) || 0
    if (score === 0) {
      return matched
    }

    return [...matched, {
      pointer,
      score,
    }]
  }
}

function suitableMultiViewers(resources: MultiPointer, state: PropertyViewState) {
  return (matched: ViewerScore[], { pointer, matchMulti }: Viewer): ViewerScore[] => {
    const score = matchMulti?.({ resources, state }) || 0
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

interface FindSingleViewers {
  object: GraphPointer
  state?: never
}

interface FindMultiViewers {
  object: MultiPointer
  state: PropertyViewState
}

type FindApplicableViewers = FindSingleViewers | FindMultiViewers

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
    ].map<[NamedNode, Viewer]>(({ viewer, match, matchMulti }) => {
      const impl = {
        pointer: ViewersController.viewerMeta.node(viewer),
        match,
        matchMulti,
      }
      return [viewer, impl]
    })

    this.viewers = new TermMap(mapInit)
  }

  findApplicableViewers({ object, state }: FindApplicableViewers): ViewerScore[] {
    if (isGraphPointer(object)) {
      return [...this.viewers.values()]
        .reduce(suitableViewers(object), [])
        .sort(byScore)
    }

    return [...this.viewers.values()]
      .reduce(suitableMultiViewers(object, state!), [])
      .sort(byScore)
  }

  get(viewer: Term): GraphPointer<NamedNode> {
    if (viewer.termType !== 'NamedNode') {
      throw new Error('Viewer must be an IRI')
    }

    return ViewersController.viewerMeta.node(viewer)
  }
}
