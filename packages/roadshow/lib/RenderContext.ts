import type { GraphPointer, MultiPointer } from 'clownface'
import { InitRenderer, LocalState, RenderContext, Show } from '../index'
import { ShapesController } from '../ShapesController'
import { ViewersController } from '../ViewersController'
import { RenderersController } from '../RenderersController'
import { ResourcesController } from '../ResourcesController'
import { CoreState } from './state'

export default abstract class<T extends CoreState, TParent = any, R extends MultiPointer = GraphPointer> implements RenderContext<T> {
  locals: LocalState
  shapes: ShapesController
  viewers: ViewersController
  renderers: RenderersController
  resources: ResourcesController
  state: T

  constructor(public parent: RenderContext<TParent>, pointer: R, state: Partial<T> = {}) {
    this.locals = {}
    this.shapes = parent.shapes
    this.viewers = parent.viewers
    this.renderers = parent.renderers
    this.resources = parent.resources
    this.state = { ...this.initState(pointer), ...state }
  }

  abstract show(params: Show): unknown
  abstract initState(pointer: R): T

  get depth(): number {
    return this.parent.depth + 1
  }

  get params(): unknown {
    return this.parent.params
  }

  requestUpdate(): void {
    this.parent.requestUpdate()
  }

  initRenderer({ viewer, shape }: InitRenderer): void {
    const objectState = this.state

    objectState.applicableViewers = this.viewers.findApplicableViewers({ object: objectState.pointer })
    if (viewer) {
      objectState.applicableViewers.unshift({
        pointer: this.viewers.get(viewer), score: null,
      })
    }

    objectState.viewer = objectState.applicableViewers[0]?.pointer
    const renderer = this.renderers.get(objectState.viewer.term)
    objectState.render = () => renderer.call(this as any, objectState.pointer, shape)
  }

  findApplicableViewers(object: GraphPointer) {
    return this.parent.findApplicableViewers(object)
  }
}
