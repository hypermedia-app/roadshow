import { ReactiveController } from 'lit'
import { NamedNode, Term } from '@rdfjs/types'
import TermMap from '@rdf-esm/term-map'
import { roadshow } from '@hydrofoil/vocabularies/builders'
import { Renderer, RenderFunc } from './index'
import * as defaultRenderers from './renderers'
import { FocusNodeState, ObjectState, PropertyState } from './lib/state'

export class RenderersController implements ReactiveController {
  static readonly defaultRenderers: Array<Renderer<any>> = Object.values(defaultRenderers)
  private renderers: Map<Term, Renderer> = new Map()

  constructor() {
    this.renderers = new TermMap()
    this.set(RenderersController.defaultRenderers)
  }

  hostConnected(): void {
    //
  }

  set(renderers: Renderer[]): void {
    for (const renderer of renderers) {
      this.renderers.set(renderer.viewer, renderer)
    }
  }

  get(state: ObjectState | FocusNodeState | PropertyState | { viewer: NamedNode }): RenderFunc<any> {
    const renderer = this.renderers.get(roadshow.RendererNotFoundViewer)!
    let { viewer } = state
    if ('loading' in state) {
      if (state.loading.size) {
        viewer = roadshow.LoadingViewer
      }
      if (state.loadingFailed.size) {
        viewer = roadshow.LoadingFailedViewer
      }
    }

    if (viewer) {
      return (this.renderers.get(viewer) || renderer).render
    }

    return renderer.render
  }
}
