import type { GraphPointer, MultiPointer } from 'clownface'
import type { InitRenderer, Show } from '../../index'
import type { ShapesController } from '../../ShapesController'
import type { ViewersController } from '../../ViewersController'
import type { RenderersController } from '../../RenderersController'
import type { ResourcesController } from '../../ResourcesController'
import type { CoreState } from '../state'
import type { ViewContext } from './index'

export default abstract class ViewContextBase<T extends CoreState, TParent = any, R extends MultiPointer = GraphPointer> implements ViewContext<T> {
  shapes: ShapesController
  viewers: ViewersController
  renderers: RenderersController
  resources: ResourcesController
  state: T

  constructor(public parent: ViewContext<TParent>, pointer: R, state: Partial<T> = {}) {
    this.shapes = parent.shapes
    this.viewers = parent.viewers
    this.renderers = parent.renderers
    this.resources = parent.resources
    this.state = { ...this.initState(pointer), ...state }
  }

  show(params: Show): unknown {
    return this.parent.show(params)
  }

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

  create(parent: ViewContext<any>, pointer: GraphPointer, state?: any): ViewContext<any> {
    return this.parent.create(parent, pointer, state)
  }
}
