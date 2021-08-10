import { css, LitElement, PropertyValues } from 'lit'
import { property } from 'lit/decorators.js'
import type { MultiPointer } from 'clownface'
import type { NamedNode } from '@rdfjs/types'
import { RoadshowController } from './RoadshowController'
import type { RoadshowView, Renderer, ViewerMatcher } from './index'
import type { ResourceLoader } from './ResourcesController'
import { ShapesLoader } from './ShapesController'
import { render } from './lib/render'
import './lib/rdfine'
import { FocusNodeState } from './lib/state'

export class RoadshowViewElement extends LitElement implements RoadshowView {
  static get styles() {
    return css`:host {
      display: block;
    }`
  }

  private roadshow: RoadshowController

  @property({ type: Object })
  resource: MultiPointer | undefined

  @property({ type: Object })
  resourceId: NamedNode | undefined

  @property({ type: Object })
  params: unknown = {}

  @property({ type: Array })
  renderers: Renderer[] = []

  @property({ type: Array })
  viewers: ViewerMatcher[] = []

  resourceLoader?: ResourceLoader
  shapesLoader?: ShapesLoader

  constructor() {
    super()
    this.roadshow = new RoadshowController(this)
  }

  get state(): FocusNodeState | null {
    return this.roadshow.state
  }

  protected async updated(_changedProperties: PropertyValues): Promise<void> {
    if (_changedProperties.has('resourceId') && this.resourceId) {
      const resource = await this.roadshow.resources.load(this.resourceId)
      if (resource) {
        this.resource = resource
      }
    }

    if (_changedProperties.has('resource')) {
      this.roadshow.prepareState()
    }

    if (_changedProperties.has('renderers')) {
      this.roadshow.refreshRenderers()
    }
  }

  render(): unknown {
    if (!(this.resource && this.roadshow.state)) {
      return ''
    }

    return render({
      state: this.roadshow.state,
      controller: this.roadshow,
      focusNode: this.resource,
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'roadshow-view': RoadshowViewElement
  }
}

customElements.define('roadshow-view', RoadshowViewElement)
