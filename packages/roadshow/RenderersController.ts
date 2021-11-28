import { ReactiveController } from 'lit'
import { NamedNode, Term } from '@rdfjs/types'
import TermMap from '@rdf-esm/term-map'
import { roadshow } from '@hydrofoil/vocabularies/builders'
import { Renderer, RoadshowView } from './index'
import * as defaultRenderers from './renderers'
import { RendererNotFoundViewer } from './renderers'
import { FocusNodeState, ObjectState, PropertyState } from './lib/state'

const LOADER_KEY = 'renderer'

type InitializedRenderer = Renderer & { initialized: true }
type UninitializedRenderer = Renderer & { initialized: boolean; init: () => Promise<void> }

const notFound: [InitializedRenderer] = [{
  ...RendererNotFoundViewer,
  initialized: true,
}]

export class RenderersController implements ReactiveController {
  static readonly defaultRenderers: Array<Renderer<any>> = Object.values(defaultRenderers)
  private renderers: Map<Term, Array<InitializedRenderer | UninitializedRenderer>> = new Map()

  constructor(private host: RoadshowView) {
    this.renderers = new TermMap()
    this.set(RenderersController.defaultRenderers)
  }

  hostConnected(): void {
    //
  }

  set(renderers: Renderer[]): void {
    for (const renderer of renderers) {
      const array = this.renderers.get(renderer.viewer) || []

      if ('init' in renderer) {
        array.push({
          ...renderer,
          init: renderer.init!,
          initialized: false,
        })
      } else {
        array.push({
          ...renderer,
          initialized: true,
        })
      }

      this.renderers.set(renderer.viewer, array)
    }
  }

  get(viewer: Term | undefined): Array<InitializedRenderer | UninitializedRenderer> {
    const renderers = viewer && this.renderers.get(viewer)
    if (!renderers?.length) {
      return this.renderers.get(roadshow.RendererNotFoundViewer) || notFound
    }

    return renderers
  }

  beginInitialize(state: ObjectState | FocusNodeState | PropertyState): void {
    const renderer = state.renderer as InitializedRenderer | UninitializedRenderer

    if (!renderer.initialized && !state.loadingFailed.has(LOADER_KEY)) {
      (async () => {
        state.loading.add('renderer')
        this.host.requestUpdate()

        try {
          await renderer.init()
          renderer.initialized = true
        } catch (e) {
          state.loadingFailed.add(LOADER_KEY)
        } finally {
          state.loading.delete(LOADER_KEY)
          this.host.requestUpdate()
        }
      })()
    }
  }

  has(viewer: NamedNode): boolean {
    return this.renderers.has(viewer)
  }
}
