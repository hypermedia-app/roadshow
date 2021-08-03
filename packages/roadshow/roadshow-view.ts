import { css, LitElement, PropertyValues } from 'lit'
import { property } from 'lit/decorators.js'
import type { GraphPointer } from 'clownface'
import type { BlankNode, NamedNode } from '@rdfjs/types'
import type { NodeShape } from '@rdfine/shacl'
import RdfResource from '@tpluscode/rdfine'
import { NodeShapeBundle, PropertyShapeBundle } from '@rdfine/shacl/bundles'
import { NodeShapeMixinEx, PropertyShapeMixinEx } from '@rdfine/dash/extensions/sh'
import { RoadshowController } from './RoadshowController'
import type { RoadshowView, Renderer, ViewerMatchInit } from './index'
import type { ResourceLoader } from './ResourcesController'
import { ShapesLoader } from './ShapesController'
import { ResourceViewState } from './lib/state'

export class RoadshowViewElement extends LitElement implements RoadshowView {
  static get styles() {
    return css`:host {
      display: block;
    }`
  }

  private roadshow: RoadshowController

  @property({ type: Object })
  resource: GraphPointer<NamedNode | BlankNode> | undefined

  @property({ type: Object })
  resourceId: NamedNode | undefined

  @property({ type: Object })
  params: unknown = {}

  shapes: NodeShape[] = []

  @property({ type: Array })
  renderers: Renderer[] = []

  viewers: ViewerMatchInit[] = []
  resourceLoader?: ResourceLoader
  shapesLoader?: ShapesLoader

  constructor() {
    super()
    this.roadshow = new RoadshowController(this)
  }

  get state(): ResourceViewState | undefined {
    return this.roadshow.rootContext?.state
  }

  protected updated(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('resource') || _changedProperties.has('resourceId')) {
      this.roadshow.prepareViewState()
    }

    if (_changedProperties.has('renderers')) {
      this.roadshow.refreshRenderers()
    }
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

RdfResource.factory.addMixin(...NodeShapeBundle, ...PropertyShapeBundle)
RdfResource.factory.addMixin(NodeShapeMixinEx, PropertyShapeMixinEx)
