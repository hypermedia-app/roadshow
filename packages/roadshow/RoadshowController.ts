import { ReactiveController } from 'lit'
import { dash, rdf } from '@tpluscode/rdf-ns-builders/strict'
import { RoadshowView } from './index'
import { create, FocusNodeState } from './lib/state'
import { RenderersController } from './RenderersController'
import { ViewersController } from './ViewersController'
import { ShapesController } from './ShapesController'
import { ResourcesController } from './ResourcesController'

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
      await this.host.requestUpdate()
    } else {
      return
    }

    await this.shapes.loadShapes(this.state, this.state.pointer!)

    await this.host.requestUpdate()
    this.state.viewer = dash.DetailsViewer
    await this.host.requestUpdate()
  }

  refreshRenderers(): void {
    this.renderers.set(this.host.renderers)
  }
}
