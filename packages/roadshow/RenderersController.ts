import { ReactiveController } from 'lit'
import { NamedNode, Term } from '@rdfjs/types'
import TermMap from '@rdf-esm/term-map'
import { roadshow } from '@hydrofoil/vocabularies/builders'
import clownface from 'clownface'
import { dataset } from '@rdf-esm/dataset'
import { Decorator, Decorators, Renderer as RendererInit, RoadshowView } from './index'
import * as defaultRenderers from './renderers'
import { RendererNotFoundViewer } from './renderers'
import { FocusNodeState, ObjectState, PropertyState } from './lib/state'
import { ViewContext } from './lib/ViewContext/index'
import { Renderer } from './lib/render'

const LOADER_KEY = 'renderer'

type Initialized<T> = T & { initialized?: true }
type Uninitialized<T> = T & { initialized: boolean; init: () => Promise<void> }
type Initializable<T> = Initialized<T> | Uninitialized<T>
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

const notFound: [Initialized<Renderer>] = [initRenderer(RendererNotFoundViewer)]

function needsInitialization(arg: Initializable<unknown>): arg is Uninitialized<unknown> {
  return !arg.initialized && 'init' in arg && typeof arg.init === 'function'
}

function toInitialize(arr: Array<Initializable<unknown>>): Array<() => Promise<void>> {
  return arr.filter(needsInitialization).map(initializable => async () => {
    await initializable.init()
    initializable.initialized = true
  })
}

export class RenderersController implements ReactiveController {
  static readonly defaultRenderers: Array<Renderer<any>> = Object.values(defaultRenderers).map(initRenderer)
  private renderers: Map<Term, Array<Initializable<Renderer>>> = new Map()
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

  get(viewer: Term | undefined): Array<Initializable<Renderer>> {
    const renderers = (viewer && this.renderers.get(viewer)) || this.renderers.get(roadshow.RendererNotFoundViewer)
    if (!renderers || renderers.length === 0) {
      return notFound
    }

    return renderers
  }

  getDecorators(state: State): Decorator<any, any>[] {
    if ('properties' in state) {
      return this.__applicableDecorators(state, this.decorators.focusNode)
    }

    if ('propertyShape' in state) {
      return this.__applicableDecorators(state, this.decorators.property)
    }

    return this.__applicableDecorators(state, this.decorators.object)
  }

  private __applicableDecorators<S extends State, VC extends ViewContext<S>>(state: S, decorators: Array<Decorator<S, VC>> = []) {
    return decorators.filter(decorator => decorator.appliesTo(state))
  }

  beginInitialize(state: State): void {
    const renderer = state.renderer as Initializable<Renderer>
    const decorators = state.decorators as Array<Initializable<Decorator<any, any>>>

    const initFuncs = toInitialize([renderer, ...decorators])

    if (initFuncs.length && !state.loadingFailed.has(LOADER_KEY)) {
      (async () => {
        this.host.requestUpdate()

        try {
          await Promise.all(initFuncs.map(init => init()))
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
  }

  has(viewer: NamedNode): boolean {
    return this.renderers.has(viewer)
  }
}
