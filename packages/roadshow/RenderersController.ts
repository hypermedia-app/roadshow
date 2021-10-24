import { ReactiveController } from 'lit'
import { NamedNode, Term } from '@rdfjs/types'
import TermMap from '@rdf-esm/term-map'
import { roadshow } from '@hydrofoil/vocabularies/builders'
import { Renderer, RoadshowView } from './index'
import * as defaultRenderers from './renderers'
import { FocusNodeState, ObjectState, PropertyState } from './lib/state'

const LOADER_KEY = 'renderer'

type InitializedRenderer = Renderer & { initialized: true }
type UnitializedRenderer = Renderer & { initialized: boolean; init: () => Promise<void> }

export class RenderersController implements ReactiveController {
  static readonly defaultRenderers: Array<Renderer<any>> = Object.values(defaultRenderers)
  private renderers: Map<Term, InitializedRenderer | UnitializedRenderer> = new Map()

  constructor(private host: RoadshowView) {
    this.renderers = new TermMap()
    this.set(RenderersController.defaultRenderers)
  }

  hostConnected(): void {
    //
  }

  set(renderers: Renderer[]): void {
    for (const renderer of renderers) {
      if ('init' in renderer) {
        this.renderers.set(renderer.viewer, {
          ...renderer,
          init: renderer.init!,
          initialized: false,
        })
      } else {
        this.renderers.set(renderer.viewer, {
          ...renderer,
          initialized: true,
        })
      }
    }
  }

  get(state: ObjectState | FocusNodeState | PropertyState): Renderer<any> {
    const notFound = this.renderers.get(roadshow.RendererNotFoundViewer)!
    const { viewer } = state

    const renderer = viewer && this.renderers.get(viewer)
    if (!renderer) {
      return notFound
    }

    if (!renderer.initialized && !state.loadingFailed.has(LOADER_KEY)) {
      state.loading.add(LOADER_KEY)
      renderer.init().then(() => {
        renderer.initialized = true
      }).catch(() => {
        state?.loadingFailed.add(renderer.viewer.value)
      }).finally(() => {
        state.loading.delete(LOADER_KEY)
        this.host.requestUpdate()
      })
    }

    if (state.loading.size) {
      return this.renderers.get(roadshow.LoadingViewer) || notFound
    }
    if (state.loadingFailed.size) {
      return this.renderers.get(roadshow.LoadingFailedViewer) || notFound
    }

    return renderer
  }

  has(viewer: NamedNode): boolean {
    return this.renderers.has(viewer)
  }
}
