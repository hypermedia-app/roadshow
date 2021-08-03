import { ReactiveController } from 'lit'
import { NamedNode, Term } from '@rdfjs/types'
import type { GraphPointer } from 'clownface'
import TermMap from '@rdf-esm/term-map'
import { RoadshowView } from './index'

export interface ResourceLoader {
  (term: NamedNode): Promise<GraphPointer>
}

export class ResourcesController implements ReactiveController {
  private resources: Map<Term, GraphPointer>
  private _load?: ResourceLoader

  constructor(private host: RoadshowView) {
    this.resources = new TermMap()
  }

  async hostConnected(): Promise<void> {
    this._load = this.host.resourceLoader

    let resource: GraphPointer
    if (this.host.resource) {
      resource = this.host.resource
      this.resources.set(resource.term, resource)
    } else if (this.host.resourceId) {
      await this.load(this.host.resourceId)
    } else {
      return
    }

    this.host.requestUpdate()
  }

  async load(term: NamedNode) {
    if (!this._load) {
      throw new Error('Resource loader not set')
    }

    const resource = await this._load(term)
    this.resources.set(term, resource)

    return resource
  }

  get(term: NamedNode): GraphPointer<NamedNode> | undefined {
    return this.resources.get(term) as any
  }
}
