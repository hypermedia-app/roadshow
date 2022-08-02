import { ReactiveController } from 'lit'
import { dash, rdf } from '@tpluscode/rdf-ns-builders'
import { MultiPointer } from 'clownface'
import { roadshow } from '@hydrofoil/vocabularies/builders'
import type { RoadshowView } from './index'
import { create, initializeProperties, FocusNodeState, PropertyState } from './lib/state'
import { RenderersController } from './RenderersController'
import { ViewersController } from './ViewersController'
import { ShapesController } from './ShapesController'
import { ResourcesController } from './ResourcesController'
import { ViewContext } from './lib/ViewContext/index'

function isFocusNodeState(state: any): state is FocusNodeState {
  return 'properties' in state && state.properties
}

export class RoadshowController implements ReactiveController {
  state: FocusNodeState
  public shapes: ShapesController;

  constructor(
    public host: RoadshowView,
    public resources = new ResourcesController(host),
    public renderers = new RenderersController(host),
    public viewers = new ViewersController(host),
    shapes?: ShapesController,
  ) {
    this.host.addController(this)

    this.shapes = shapes || new ShapesController(host, resources)
    this.state = create({
      term: rdf.nil,
    })
  }

  hostConnected(): void {
    this.refreshRenderers()
  }

  async initState(): Promise<void> {
    await this.viewers.loadDash()

    if (this.host.resourceId && !this.host.resource) {
      this.state = create({
        term: this.host.resourceId,
      })
      await this.resources.loadToState(this.state)
    } else if (this.host.resource) {
      const shape = await this.shapes.loadDashShape(this.host.resource)
      this.state = create({
        shape,
        term: this.host.resource.term,
      })
      this.state.pointer = this.host.resource
    } else {
      return
    }

    await this.initShapes(this.state, this.state.pointer!)

    this.state.viewer = dash.DetailsViewer
    await this.host.requestUpdate()
  }

  async initShapes(state: PropertyState | FocusNodeState, objects: MultiPointer): Promise<void> {
    if (state.shapesLoaded) {
      return
    }

    await this.shapes.loadShapes(state, objects)
    if (isFocusNodeState(state)) {
      state.properties = []
      if (state.shape) {
        state.properties = initializeProperties(state.shape, state.pointer)
      }
    }
    delete state.renderer
    this.host.requestUpdate()
  }

  initRenderer<VC extends ViewContext<any>>(context: VC) {
    const { state } = context
    if (!state.renderer) {
      state.renderers = this.renderers.get(state.viewer);
      ([state.renderer] = state.renderers)
      state.decorators = this.renderers.getDecorators(context)
    }

    this.renderers.beginInitialize(context)

    if (state.loading.size) {
      return this.renderers.get(roadshow.LoadingViewer)[0]
    }
    if (state.loadingFailed.size) {
      return this.renderers.get(roadshow.LoadingFailedViewer)[0]
    }

    return state.renderer
  }

  refreshRenderers(): void {
    this.renderers.set(this.host.renderers, this.host.decorators)
  }
}
