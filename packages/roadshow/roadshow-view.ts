import { css, LitElement, PropertyValues } from 'lit'
import { property } from 'lit/decorators.js'
import type { GraphPointer } from 'clownface'
import type { BlankNode, NamedNode } from '@rdfjs/types'
import { RoadshowController } from './RoadshowController.js'
import type { RoadshowView, Renderer, ViewerMatcher, Decorator } from './index.js'
import type { ResourceLoader } from './ResourcesController.js'
import { ShapesLoader } from './ShapesController.js'
import { render } from './lib/render.js'
import './lib/rdfine.js'
import { FocusNodeState } from './lib/state.js'
import { Params } from './lib/ViewContext/index.js'

export class RoadshowViewElement extends LitElement implements RoadshowView {
  static get styles() {
    return css`:host {
      display: block;
    }`
  }

  private roadshow: RoadshowController

  @property({ type: Object })
  resource: GraphPointer<BlankNode | NamedNode> | undefined

  @property({ type: Object })
  resourceId: NamedNode | undefined

  @property({ type: Object })
  params: Partial<Params> = {}

  @property({ type: Array })
  renderers: Renderer[] = []

  @property({ type: Array })
  decorators: Decorator[] | undefined

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
      await this.roadshow.initState()
    }

    if (_changedProperties.has('resource')) {
      this.roadshow.initState()
    }

    if (_changedProperties.has('renderers') || _changedProperties.has('decorators')) {
      this.roadshow.refreshRenderers()
    }
  }

  render(): unknown {
    return render({
      state: this.roadshow.state,
      controller: this.roadshow,
      focusNode: this.roadshow.state.pointer,
      params: {
        language: navigator.language,
        ...this.params,
      },
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'roadshow-view': RoadshowViewElement
  }
}

customElements.define('roadshow-view', RoadshowViewElement)
