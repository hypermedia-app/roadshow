import { NamedNode, Term } from '@rdfjs/types'
import type { GraphPointer } from 'clownface'
import TermMap from '@rdf-esm/term-map'
import { RoadshowView } from './index.js'
import { FocusNodeState } from './lib/state.js'

const LOADER_KEY = 'representation'

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

  async loadToState(state: FocusNodeState): Promise<void> {
    if (state.term.termType !== 'NamedNode' || typeof state.pointer !== 'undefined') {
      return
    }

    state.loading.add(LOADER_KEY)

    const loaded = await this.load(state.term)
    state.loading.delete(LOADER_KEY)
    if (loaded) {
      state.pointer = loaded
    } else {
      state.loadingFailed.add(LOADER_KEY)
    }
    await this.host.requestUpdate()
  }
}
