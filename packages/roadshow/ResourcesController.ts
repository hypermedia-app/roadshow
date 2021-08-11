import { NamedNode, Term } from '@rdfjs/types'
import type { GraphPointer } from 'clownface'
import TermMap from '@rdf-esm/term-map'
import { roadshow } from '@hydrofoil/vocabularies/builders'
import { RoadshowView } from './index'
import { FocusNodeState } from './lib/state'

export interface ResourceLoader {
  (term: NamedNode): Promise<GraphPointer | null | undefined>
}

export class ResourcesController {
  private resources: Map<Term, GraphPointer>

  constructor(private host: RoadshowView) {
    this.resources = new TermMap()
  }

  async load(term: NamedNode): Promise<GraphPointer<NamedNode> | null | undefined> {
    if (!this.host.resourceLoader) {
      throw new Error('Resource loader not set')
    }

    const resource = await this.host.resourceLoader(term)
    if (resource) {
      this.resources.set(term, resource)
    }

    return resource as any
  }

  async updateState(state: FocusNodeState): Promise<void> {
    if (state.term.termType !== 'NamedNode' || typeof state.pointer !== 'undefined') {
      return
    }

    const selectedViewer = state.viewer
    state.viewer = roadshow.LoadingViewer
    await this.host.requestUpdate()

    const loaded = await this.load(state.term)
    if (loaded) {
      state.pointer = loaded
      state.viewer = selectedViewer
    } else {
      state.viewer = roadshow.LoadingFailedViewer
    }
    await this.host.requestUpdate()
  }
}
