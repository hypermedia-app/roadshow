import { ReactiveController } from 'lit'
import { NamedNode, Term } from '@rdfjs/types'
import TermMap from '@rdf-esm/term-map'
import { roadshow } from '@hydrofoil/vocabularies/builders'
import clownface from 'clownface'
import { dataset } from '@rdf-esm/dataset'
import { Decorator, Decorators, Renderer as RendererInit, RenderFunc, RoadshowView } from './index'
import * as defaultRenderers from './renderers'
import { RendererNotFoundViewer } from './renderers'
import { FocusNodeState, ObjectState, PropertyState } from './lib/state'
import { ViewContext } from './lib/ViewContext/index'
import { Renderer } from './lib/render'

const LOADER_KEY = 'renderer'

type InitializedRenderer = Renderer & { initialized?: true }
type UninitializedRenderer = Renderer & { initialized: boolean; init: () => Promise<void> }
type State = ObjectState | FocusNodeState | PropertyState

function initRenderer({ init, render, viewer, id, meta }: RendererInit<any>): Renderer<any> {
  const graph = clownface({ dataset: dataset() })
  const node = id ? graph.node(id) : graph.blankNode()
  meta?.(node)

  return {
    init,
    render,
    viewer,
    get id() {
      return node.term
    },
    meta: node,
  }
}

const notFound: [InitializedRenderer] = [initRenderer(RendererNotFoundViewer)]

export class RenderersController implements ReactiveController {
  static readonly defaultRenderers: Array<Renderer<any>> = Object.values(defaultRenderers).map(initRenderer)
  private renderers: Map<Term, Array<InitializedRenderer | UninitializedRenderer>> = new Map()
  private decorators: Decorators = {}

  constructor(private host: RoadshowView) {
    this.renderers = new TermMap()
  }

  hostConnected(): void {
    //
  }

  set(renderers: RendererInit[], decorators: Decorators = {}): void {
    this.decorators = decorators

    this.renderers.clear()
    for (const renderer of [...RenderersController.defaultRenderers, ...renderers.map(initRenderer)]) {
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

  decorate(renderer: Renderer, state: State): Renderer {
    if ('properties' in state) {
      return this.__applyDecorators(renderer, state, this.decorators.focusNode)
    }

    if ('propertyShape' in state) {
      return this.__applyDecorators(renderer, state, this.decorators.property)
    }

    return this.__applyDecorators(renderer, state, this.decorators.object)
  }

  private __applyDecorators<S extends State, VC extends ViewContext<S>>(renderer: Renderer<any>, state: S, decorators: Array<Decorator<S, VC>> = []): Renderer<any> {
    const applicable = decorators.filter(decorator => decorator.appliesTo(state))
    if (!applicable.length) {
      return renderer
    }

    const initFuncs = [renderer.init, ...applicable.map(({ init }) => init)].filter(init => !!init)
    let init: Renderer['init']
    if (initFuncs.length) {
      init = async () => { await Promise.all(initFuncs) }
    }

    const combinedRender = applicable.reduceRight((previous, { decorate }) => function decoratedRender(arg) {
      return decorate.call(this, () => previous.call(this, arg))
    }, renderer.render as RenderFunc<VC>)

    return {
      ...renderer,
      init,
      render(ptr) {
        return combinedRender.call(this, ptr)
      },
    }
  }

  beginInitialize(state: State): void {
    const renderer = state.renderer as InitializedRenderer | UninitializedRenderer

    const shouldInit = renderer.initialized === false || (!renderer.initialized && 'init' in renderer)

    if (shouldInit && !state.loadingFailed.has(LOADER_KEY)) {
      (async () => {
        state.loading.add('renderer')
        this.host.requestUpdate()

        try {
          await renderer.init?.()
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
