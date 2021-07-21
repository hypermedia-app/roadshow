import { html, ReactiveController } from 'lit'
import type { GraphPointer } from 'clownface'
import { NamedNode } from '@rdfjs/types'
import { dash, sh, xsd } from '@tpluscode/rdf-ns-builders/strict'
import { literal } from '@rdf-esm/dataset'
import { roadshow } from '@hydrofoil/vocabularies/builders/strict'
import { PropertyShape } from '@rdfine/shacl'
import { RenderContext, Renderer, RoadshowView } from './index'
import { RenderersController } from './RenderersController'
import { ViewersController, ViewerScore } from './ViewersController'
import { ShapesController } from './ShapesController'
import { ResourcesController } from './ResourcesController'
import { NodeViewState, PropertyViewState } from './lib/state'

const TRUE = literal('true', xsd.boolean)

export class RoadshowController implements ReactiveController {
  private __render: Renderer['render'] | undefined

  state: NodeViewState | null = null

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
    return this.prepareViewState()
  }

  async prepareViewState(): Promise<void> {
    const { resourceId } = this.host
    let resource: GraphPointer | undefined
    if (this.host.resource) {
      resource = this.host.resource
    } else if (resourceId) {
      resource = await this.resources.load?.(resourceId)
    }

    if (!resource) {
      this.state = null
      return this.host.requestUpdate()
    }

    let applicableViewers: ViewerScore[] = []
    let viewer: GraphPointer<NamedNode> | undefined
    const applicableShapes = await this.shapes.findApplicableShape({ resource })
    const [shape] = applicableShapes

    if (shape) {
      applicableViewers = this.viewers.findApplicableViewers(resource)
      applicableViewers = [...applicableViewers, { pointer: this.viewers.get(dash.DetailsViewer), score: null }]
      viewer = applicableViewers[0]?.pointer
      this.__render = this.renderers.get(viewer.term)
    }

    this.state = {
      pointer: resource,
      applicableShapes,
      shape,
      properties: {},
      applicableViewers,
      viewer,
    }

    return this.host.requestUpdate()
  }

  render(): unknown {
    if (!this.state?.pointer) {
      return RoadshowController.renderLoadingSlot()
    }
    if (!this.state?.shape) {
      return RoadshowController.renderNoShapeSlot()
    }
    if (!this.__render) {
      return RoadshowController.renderNoRendererSlot()
    }

    const { viewers, renderers, resources, host } = this

    const context: RenderContext<NodeViewState> = {
      depth: 0,
      state: this.state,
      renderers: this.renderers,
      viewers: this.viewers,
      shapes: this.shapes,
      params: this.host.params,
      requestUpdate: this.host.requestUpdate.bind(this.host),
      show({ resource, property, shape }) {
        let propertyKey: string | undefined
        let propertyShape: PropertyShape | undefined
        if ('termType' in property) {
          propertyKey = property.value
        } else {
          propertyKey = property.pointer.out(sh.path).value
          propertyShape = property
        }
        if (!propertyKey) {
          throw new Error('Missing property path term')
        }

        const propertyState: PropertyViewState = this.state.properties[propertyKey] || {
          shape: propertyShape,
          objects: {},
        }
        const objectState = propertyState.objects[resource.term.value] || {
          pointer: resource,
          applicableViewers: [],
        }

        if (objectState?.render) {
          return objectState.render()
        }

        const prepareRenderer = () => {
          objectState.applicableViewers = viewers.findApplicableViewers(objectState.pointer)
          objectState.viewer = objectState.applicableViewers[0]?.pointer
          const renderer = renderers.get(objectState.viewer.term)
          const childContext = {
            ...this,
            depth: this.depth + 1,
          }
          objectState.render = () => renderer.call(childContext, objectState.pointer, shape)
        }

        if (propertyShape?.pointer.out(roadshow.dereference).term?.equals(TRUE) && resource.term.termType === 'NamedNode') {
          const previouslyLoaded = resources.get(resource.term)
          if (previouslyLoaded) {
            objectState.pointer = previouslyLoaded
            prepareRenderer()
          } else {
            objectState.render = RoadshowController.renderLoadingSlot
            resources.load?.(resource.term).then(() => {
              delete objectState.render
              host.requestUpdate()
            })
          }
        } else {
          prepareRenderer()
        }

        this.state.properties[propertyKey] = propertyState
        propertyState.objects[resource.term.value] = objectState
        return objectState.render!()
      },
    }

    return this.__render.call(context, this.state.pointer, this.state.shape)
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
