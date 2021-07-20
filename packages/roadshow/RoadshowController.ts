import { html, ReactiveController } from 'lit'
import type { GraphPointer } from 'clownface'
import { NodeShape } from '@rdfine/shacl'
import { NamedNode } from '@rdfjs/types'
import { dash, xsd } from '@tpluscode/rdf-ns-builders'
import { literal } from '@rdf-esm/dataset'
import { roadshow } from '@hydrofoil/vocabularies/builders/strict'
import { RenderContext, Renderer, RoadshowView } from './index'
import { RenderersController } from './RenderersController'
import { ViewersController } from './ViewersController'
import { ShapesController } from './ShapesController'
import { ResourcesController } from './ResourcesController'

const TRUE = literal('true', xsd.boolean)

export class RoadshowController implements ReactiveController {
  private resource: GraphPointer | undefined
  private __render: Renderer['render'] | undefined

  shape?: NodeShape
  applicableShapes: NodeShape[] = []
  viewer: GraphPointer<NamedNode> | undefined
  applicableViewers: GraphPointer<NamedNode>[] = []

  constructor(
    private host: RoadshowView,
    private resources = new ResourcesController(host),
    private renderers = new RenderersController(host),
    private viewers = new ViewersController(host),
    private shapes = new ShapesController(host),
  ) {
    this.host.addController(renderers)
    this.host.addController(viewers)
    this.host.addController(shapes)
    this.host.addController(resources)
    this.host.addController(this)
  }

  hostConnected(): Promise<void> {
    return this.prepareResource()
  }

  async prepareResource(): Promise<void> {
    const { resourceId } = this.host
    if (this.host.resource) {
      this.resource = this.host.resource
    } else if (resourceId) {
      this.resource = await this.resources.load?.(resourceId)
    }

    if (this.resource) {
      this.applicableShapes = this.shapes.findApplicableShape(this.resource);
      ([this.shape] = this.applicableShapes)
      const { shape } = this

      if (shape) {
        const applicableViewers = this.viewers.findApplicableViewers(this.resource).map(({ pointer }) => pointer)
        this.applicableViewers = [...applicableViewers, this.viewers.get(dash.DetailsViewer)];
        ([this.viewer] = this.applicableViewers)
        this.__render = this.renderers.get(this.viewer?.term)
      }
    }

    this.host.requestUpdate()
  }

  render(): unknown {
    if (!this.resource) {
      return RoadshowController.__renderLoadingSlot()
    }
    if (!this.shape) {
      return RoadshowController.__renderNoShapeSlot()
    }
    if (!this.__render) {
      return RoadshowController.__renderNoRendererSlot()
    }

    const { viewers, renderers, resources, host } = this

    const context: RenderContext = {
      renderers: this.renderers,
      viewers: this.viewers,
      shapes: this.shapes,
      params: this.host.params,
      show({ resource, property, shape }) {
        let toRender = resource
        if (property?.pointer.out(roadshow.dereference).term?.equals(TRUE) && resource.term.termType === 'NamedNode') {
          const dereferenced = resources.get(resource.term)
          if (dereferenced) {
            toRender = dereferenced
          } else {
            resources.load?.(resource.term).then(() => {
              host.requestUpdate()
            })
            return RoadshowController.__renderLoadingSlot()
          }
        }

        const [viewer] = viewers.findApplicableViewers(toRender).map(v => v.pointer)
        const render = renderers.get(viewer?.term)
        return render.call(this, toRender, shape!)
      },
    }

    return this.__render.call(context, this.resource, this.shape)
  }

  private static __renderNoShapeSlot() {
    return html`<slot name="no-shape">No applicable shape found...</slot>`
  }

  private static __renderLoadingSlot() {
    return html`<slot name="loading">Loading...</slot>`
  }

  private static __renderNoRendererSlot() {
    return html`<slot name="no-renderer">No renderer!</slot>`
  }
}
