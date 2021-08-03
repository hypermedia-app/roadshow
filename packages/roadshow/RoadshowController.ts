import { ReactiveController } from 'lit'
import type { GraphPointer } from 'clownface'
import { NamedNode } from '@rdfjs/types'
import { dash } from '@tpluscode/rdf-ns-builders/strict'
import type { BlankNode } from 'rdf-js'
import { Renderer, RoadshowView } from './index'
import { RenderersController } from './RenderersController'
import { ViewersController, ViewerScore } from './ViewersController'
import { ShapesController } from './ShapesController'
import { ResourcesController } from './ResourcesController'
import { ResourceViewState } from './lib/state'
import type { ViewContext } from './lib/ViewContext'
import RootContext from './lib/ViewContext/RootContext'
import * as fallback from './lib/fallbackSlots'

export class RoadshowController implements ReactiveController {
  private __render: Renderer['render'] | undefined

  rootContext: ViewContext<ResourceViewState> | null = null

  constructor(
    public host: RoadshowView,
    public resources = new ResourcesController(host),
    public renderers = new RenderersController(),
    public viewers = new ViewersController(host),
    public shapes = new ShapesController(host),
  ) {
    this.host.addController(renderers)
    this.host.addController(viewers)
    this.host.addController(shapes)
    this.host.addController(resources)
    this.host.addController(this)
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  hostConnected(): void {
  }

  async prepareViewState(): Promise<void> {
    const { resourceId } = this.host
    let resource: GraphPointer<NamedNode | BlankNode> | undefined
    if (this.host.resource) {
      resource = this.host.resource
    } else if (resourceId) {
      resource = await this.resources.load?.(resourceId)
    }

    if (!resource) {
      this.rootContext = null
      return this.host.requestUpdate()
    }

    let applicableViewers: ViewerScore[] = []
    let viewer: GraphPointer<NamedNode> | undefined
    const applicableShapes = await this.shapes.findApplicableShape({ resource })
    const [shape] = applicableShapes

    if (shape) {
      applicableViewers = this.viewers.findApplicableViewers({ object: resource })
      applicableViewers = [...applicableViewers, { pointer: this.viewers.get(dash.DetailsViewer), score: null }]
      const [dashViewer] = shape.pointer.out(dash.viewer).toArray()
      if (dashViewer) {
        applicableViewers.unshift({
          pointer: dashViewer as any,
          score: null,
        })
      }
      viewer = applicableViewers[0]?.pointer
      this.__render = this.renderers.get(viewer.term)
    }

    this.rootContext = new RootContext(this, {
      pointer: resource,
      applicableShapes,
      shape,
      properties: {},
      applicableViewers,
      viewer,
      locals: {},
    })

    return this.host.requestUpdate()
  }

  render(): unknown {
    if (!this.rootContext?.state.pointer) {
      return fallback.renderLoadingSlot()
    }
    if (!this.rootContext?.state.shape) {
      return fallback.renderNoShapeSlot()
    }
    if (!this.__render) {
      return fallback.renderNoRendererSlot()
    }

    return this.__render.call(this.rootContext, this.rootContext.state.pointer, this.rootContext.state.shape)
  }

  refreshRenderers(): void {
    this.renderers.set(this.host.renderers)
  }
}
