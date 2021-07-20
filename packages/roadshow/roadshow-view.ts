import { LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import type { GraphPointer } from 'clownface'
import type { BlankNode, NamedNode } from '@rdfjs/types'
import type { NodeShape } from '@rdfine/shacl'
import { RoadshowController } from './RoadshowController'
import type { RoadshowView, Renderer, ViewerMatchInit } from './index'
import type { ResourceLoader } from './ResourcesController'

export class RoadshowViewElement extends LitElement implements RoadshowView {
  private roadshow: RoadshowController

  @property({ type: Object })
  resource: GraphPointer<NamedNode | BlankNode> | undefined

  @property({ type: Object })
  resourceId: NamedNode | undefined

  @property({ type: Object })
  params: unknown = {}

  shapes: NodeShape[] = []
  renderers: Renderer[] = []
  viewers: ViewerMatchInit[] = []
  resourceLoader?: ResourceLoader

  constructor() {
    super()
    this.roadshow = new RoadshowController(this)
  }

  render(): unknown {
    return this.roadshow.render()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'roadshow-view': RoadshowViewElement
  }
}

customElements.define('roadshow-view', RoadshowViewElement)
