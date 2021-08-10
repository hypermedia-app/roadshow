import { NamedNode, Term } from '@rdfjs/types'
import type { GraphPointer } from 'clownface'
import TermMap from '@rdf-esm/term-map'
import { RoadshowView } from './index'

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
}
