import { ReactiveController } from 'lit'
import clownface, { AnyPointer, GraphPointer } from 'clownface'
import TermMap from '@rdfjs/term-map'
import { NamedNode, Term } from '@rdfjs/types'
import factory from '@rdfjs/data-model'
import $rdf from '@rdfjs/dataset'
import { dash, rdf } from '@tpluscode/rdf-ns-builders'
import { RoadshowView, Viewer, ViewerMatcher } from './index.js'
import * as defaultViewers from './viewers/index.js'
import { ViewerScore } from './lib/state.js'

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

function byScore(left: ViewerScore, right: ViewerScore) {
  return (right.score || -1) - (left.score || -1)
}

export class ViewersController implements ReactiveController {
  static readonly defaultViewers: Array<ViewerMatcher> = Object.values(defaultViewers)
  static readonly viewerMeta: AnyPointer = clownface({ dataset: $rdf.dataset() })

  private __dashLoaded = false
  viewers: Map<NamedNode, Viewer>

  constructor(private host: RoadshowView) {
    this.viewers = new TermMap()
    host.addController(this)
  }

  async loadDash(): Promise<void> {
    if (this.__dashLoaded) {
      return
    }
    this.__dashLoaded = true
    const Dash = await import('@vocabulary/dash')
    for (const quad of Dash.default({ factory })) {
      ViewersController.viewerMeta.dataset.add(quad)
    }
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

  isMultiViewer(viewer: Term): boolean {
    return ViewersController.viewerMeta.node(viewer).has(rdf.type, dash.MultiViewer).terms.length > 0
  }
}
