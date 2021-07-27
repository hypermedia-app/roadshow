import { GraphPointer } from 'clownface'
import type { ShapesController } from '../../ShapesController'
import type { ViewersController, ViewerScore } from '../../ViewersController'
import type { RenderersController } from '../../RenderersController'
import type { ResourcesController } from '../../ResourcesController'
import type { InitRenderer, LocalState, Show } from '../../index'

export interface ViewContext<S, T = unknown> {
  depth: number
  parent?: ViewContext<any, T>
  state: S & { locals: LocalState }
  params: T
  shapes: ShapesController
  viewers: ViewersController
  renderers: RenderersController
  resources: ResourcesController
  initRenderer(overrides: InitRenderer): void
  show(params: Show): unknown
  requestUpdate(): void
  findApplicableViewers(ptr: GraphPointer): ViewerScore[]
  create(parent: ViewContext<any>, pointer: GraphPointer, state?: any): ViewContext<any>
}
