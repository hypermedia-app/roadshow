import { ReactiveController } from 'lit'
import { dash, sh } from '@tpluscode/rdf-ns-builders/strict'
import { fromPointer, NodeShape } from '@rdfine/shacl/lib/NodeShape'
import { RoadshowView } from './index'
import { create, FocusNodeState } from './lib/state'
import { RenderersController } from './RenderersController'
import { ViewersController } from './ViewersController'
import { ShapesController } from './ShapesController'
import { ResourcesController } from './ResourcesController'
import { isResource } from './lib/clownface'

export class RoadshowController implements ReactiveController {
  state: FocusNodeState | null = null

  constructor(
    public host: RoadshowView,
    public resources = new ResourcesController(host),
    public renderers = new RenderersController(),
    public viewers = new ViewersController(host),
    public shapes = new ShapesController(host),
  ) {
    this.host.addController(this)
  }

  hostConnected(): void {
    this.refreshRenderers()
    this.prepareState()
  }

  async prepareState(): Promise<void> {
    if (!this.host.resource) {
      return
    }

    const [dashShape] = this.host.resource.out(dash.shape).toArray().filter(isResource)
    let shape: NodeShape | undefined
    if (dashShape) {
      if (dashShape.out(sh.property).terms.length) {
        shape = fromPointer(dashShape)
      } else if (dashShape.term.termType === 'NamedNode') {
        const loaded = await this.resources.load(dashShape.term)
        if (loaded) {
          shape = fromPointer(loaded)
        }
      }
    }

    this.state = create({
      shape,
      viewer: dash.DetailsViewer,
    })

    await this.host.requestUpdate()
  }

  refreshRenderers(): void {
    this.renderers.set(this.host.renderers)
  }
}
