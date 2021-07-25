import { html, ReactiveController } from 'lit'
import type { GraphPointer } from 'clownface'
import { NamedNode, Term } from '@rdfjs/types'
import { dash, sh, xsd } from '@tpluscode/rdf-ns-builders/strict'
import { literal } from '@rdf-esm/dataset'
import { roadshow } from '@hydrofoil/vocabularies/builders/strict'
import { PropertyShape } from '@rdfine/shacl'
import type { BlankNode } from 'rdf-js'
import { LocalState, RenderContext, Renderer, RoadshowView } from './index'
import { RenderersController } from './RenderersController'
import { ViewersController, ViewerScore } from './ViewersController'
import { ShapesController } from './ShapesController'
import { ResourcesController } from './ResourcesController'
import { initState, NodeViewState, PropertyViewState } from './lib/state'
import { isGraphPointer } from './lib/clownface'

const TRUE = literal('true', xsd.boolean)

export class RoadshowController implements ReactiveController {
  private __render: Renderer['render'] | undefined

  state: NodeViewState | null = null
  locals: LocalState = {}

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
    let resource: GraphPointer<NamedNode | BlankNode> | undefined
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
      applicableViewers = this.viewers.findApplicableViewers({ object: resource })
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
      locals: this.locals,
      renderers: this.renderers,
      viewers: this.viewers,
      shapes: this.shapes,
      get params() { return host.params },
      requestUpdate: this.host.requestUpdate.bind(this.host),
      show({ resource, property, shape, viewer }) {
        let propertyKey: string | undefined
        let propertyShape: PropertyShape | undefined
        let path: Term | undefined
        if ('termType' in property) {
          propertyKey = property.value
          path = property
        } else {
          path = property.pointer.out(sh.path).term
          propertyKey = path?.value
          propertyShape = property
        }
        if (!propertyKey) {
          throw new Error('Missing property path term')
        }

        const propertyState: PropertyViewState = this.state.properties
          ? (this.state.properties[propertyKey] || {
            shape: propertyShape,
            objects: {},
            path,
          })
          : this.state as any as PropertyViewState

        if (!isGraphPointer(resource)) {
          if (!propertyState.render) {
            propertyState.applicableViewers = viewers.findApplicableViewers({ object: resource, state: propertyState })
            propertyState.viewer = propertyState.applicableViewers[0]?.pointer

            if (!propertyState.viewer) {
              propertyState.render = () => html`${resource.toArray().map(obj => this.show({
                resource: obj,
                property,
                shape,
                viewer,
              }))}`
            } else {
              propertyState.render = () => {
                const render: any = this.renderers.get(propertyState.viewer?.term)
                const childContext = {
                  ...this,
                  get params() { return host.params },
                  state: propertyState,
                  depth: this.depth + 1,
                }
                return render.call(childContext, resource)
              }
            }
          }

          return propertyState.render()
        }

        const objectState = propertyState.objects[resource.term.value] || initState(resource)

        if (objectState?.render) {
          return objectState.render()
        }

        const initRenderer = () => {
          objectState.applicableViewers = viewers.findApplicableViewers({ object: objectState.pointer })
          if (propertyShape?.viewer) {
            objectState.applicableViewers.unshift({
              pointer: viewers.get(propertyShape.viewer.id), score: null,
            })
          }
          if (viewer) {
            objectState.applicableViewers.unshift({
              pointer: viewers.get(viewer), score: null,
            })
          }

          objectState.viewer = objectState.applicableViewers[0]?.pointer
          const renderer = renderers.get(objectState.viewer.term)
          const childContext = {
            ...this,
            get params() { return host.params },
            state: objectState,
            depth: this.depth + 1,
          }
          objectState.render = () => renderer.call(childContext, objectState.pointer, shape)
        }

        if (propertyShape?.pointer.out(roadshow.dereference).term?.equals(TRUE) && resource.term.termType === 'NamedNode') {
          const previouslyLoaded = resources.get(resource.term)
          if (previouslyLoaded) {
            objectState.pointer = previouslyLoaded
            initRenderer()
          } else {
            objectState.render = RoadshowController.renderLoadingSlot
            resources.load?.(resource.term).then(() => {
              delete objectState.render
              host.requestUpdate()
            })
          }
        } else {
          initRenderer()
        }

        if (this.state.properties) this.state.properties[propertyKey] = propertyState
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
