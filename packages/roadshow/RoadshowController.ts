import { html, ReactiveController } from 'lit'
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

export class RoadshowController implements ReactiveController {
  private __render: Renderer['render'] | undefined

  rootContext: ViewContext<ResourceViewState> | null = null

  constructor(
    public host: RoadshowView,
    public resources = new ResourcesController(host),
    public renderers = new RenderersController(host),
    public viewers = new ViewersController(host),
    public shapes = new ShapesController(host),
  ) {
    this.host.addController(renderers)
    this.host.addController(viewers)
    this.host.addController(shapes)
    this.host.addController(resources)
    this.host.addController(this)
  }

  hostConnected(): Promise<void> {
    return this.prepareViewState()
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
      return RoadshowController.renderLoadingSlot()
    }
    if (!this.rootContext?.state.shape) {
      return RoadshowController.renderNoShapeSlot()
    }
    if (!this.__render) {
      return RoadshowController.renderNoRendererSlot()
    }

    return this.__render.call(this.rootContext, this.rootContext.state.pointer, this.rootContext.state.shape)
  }

  static renderNoShapeSlot() {
    return html`<slot name="no-shape">No applicable shape found...</slot>`
  }

  static renderLoadingSlot() {
    return html`<slot name="loading">Loading...</slot>`
  }

  static renderNoRendererSlot() {
    return html`<slot name="no-renderer">No renderer!</slot>`
  }
}
