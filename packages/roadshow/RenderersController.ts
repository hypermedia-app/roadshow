import { ReactiveController } from 'lit'
import { NamedNode, Term } from '@rdfjs/types'
import TermMap from '@rdf-esm/term-map'
import { roadshow } from '@hydrofoil/vocabularies/builders'
import clownface from 'clownface'
import { dataset } from '@rdf-esm/dataset'
import { Decorator, Renderer as RendererInit, RoadshowView } from './index'
import * as defaultRenderers from './renderers'
import { RendererNotFoundViewer } from './renderers'
import { AnyState } from './lib/state'
import { Renderer } from './lib/render'
import { Decorates } from './lib/decorator'
import { ViewContext } from './lib/ViewContext/index'

const LOADER_KEY = 'renderer'

type Initialized<T> = T & { initialized?: true }
type Uninitialized<T> = T & { initialized: boolean; init: (context: any) => Promise<void> }
export type Initializable<T> = Initialized<T> | Uninitialized<T>

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

const notFound: [Initialized<Renderer>] = [initRenderer(RendererNotFoundViewer)]

function needsInitialization(arg: Initializable<unknown>): arg is Uninitialized<unknown> {
  return !arg.initialized && 'init' in arg && typeof arg.init === 'function'
}

function toInitialize(arr: Array<Initializable<unknown>>): Array<(context: unknown) => Promise<void>> {
  return arr.filter(needsInitialization).map(initializable => async (context: unknown) => {
    await initializable.init(context)
    initializable.initialized = true
  })
}

export class RenderersController implements ReactiveController {
  static readonly defaultRenderers: Array<Renderer<any>> = Object.values(defaultRenderers).map(initRenderer)
  private renderers: Map<Term, Array<Initializable<Renderer>>> = new Map()
  private decorators: Decorator[] = []

  constructor(private host: RoadshowView) {
    this.renderers = new TermMap()
  }

  hostConnected(): void {
    //
  }

  set(renderers: RendererInit[], decorators: Decorator[] = []): void {
    this.decorators = decorators

    this.renderers.clear()
    for (const renderer of renderers.map(initRenderer)) {
      this.__addRenderer(renderer)
    }
    for (const renderer of RenderersController.defaultRenderers) {
      if (!this.renderers.has(renderer.viewer)) {
        this.__addRenderer(renderer)
      }
    }
  }

  private __addRenderer(renderer: Renderer) {
    const array = this.renderers.get(renderer.viewer) || []

    if (typeof renderer.init === 'function') {
      array.push({
        ...renderer,
        init: renderer.init,
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

  get(viewer: Term | undefined): Array<Initializable<Renderer>> {
    const renderers = (viewer && this.renderers.get(viewer)) || this.renderers.get(roadshow.RendererNotFoundViewer)
    if (!renderers || renderers.length === 0) {
      return notFound
    }

    return renderers
  }

  getDecorators(context: ViewContext<AnyState>): Decorator[] {
    const { state } = context
    let decorates: Decorates

    if ('properties' in state) {
      decorates = 'focusNode'
    } else if ('propertyShape' in state) {
      decorates = 'property'
    } else {
      decorates = 'object'
    }

    return this.decorators.filter(decorator => (decorator.decorates.includes(decorates)) && decorator.appliesTo(context))
  }

  beginInitialize(context: ViewContext<AnyState>): Promise<void> | undefined {
    const { state } = context
    const renderer = state.renderer as Initializable<Renderer>
    const decorators = state.decorators as any as Array<Initializable<Decorator>>

    const initFuncs = toInitialize([renderer, ...decorators])

    if (initFuncs.length && !state.loadingFailed.has(LOADER_KEY) && !state.loading.has(LOADER_KEY)) {
      state.loading.add(LOADER_KEY)

      return (async () => {
        try {
          await Promise.all(initFuncs.map(init => init(context)))
          renderer.initialized = true
          state.renderer = renderer
        } catch (e) {
          state.loadingFailed.add(LOADER_KEY)
        } finally {
          state.loading.delete(LOADER_KEY)
          this.host.requestUpdate()
        }
      })()
    }

    return undefined
  }

  has(viewer: NamedNode): boolean {
    return this.renderers.has(viewer)
  }
}
