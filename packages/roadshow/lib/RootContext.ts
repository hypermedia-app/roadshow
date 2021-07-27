import { PropertyShape } from '@rdfine/shacl'
import { sh } from '@tpluscode/rdf-ns-builders/strict'
import type { GraphPointer, MultiPointer } from 'clownface'
import { RenderContext, Show } from '../index'
import { NodeViewState } from './state'
import type { RoadshowController } from '../RoadshowController'
import { ShapesController } from '../ShapesController'
import { ViewersController } from '../ViewersController'
import { RenderersController } from '../RenderersController'
import PropertyRenderContext from './PropertyRenderContext'
import { ResourcesController } from '../ResourcesController'

export default class implements RenderContext<NodeViewState> {
  shapes: ShapesController
  viewers: ViewersController
  renderers: RenderersController
  resources: ResourcesController

  readonly locals = {}
  requestUpdate: OmitThisParameter<() => void>;

  constructor(private controller: RoadshowController, public state: NodeViewState) {
    this.shapes = controller.shapes
    this.viewers = controller.viewers
    this.renderers = controller.renderers
    this.resources = controller.resources
    this.requestUpdate = controller.host.requestUpdate.bind(controller.host)
    this.locals = {}
  }

  get depth(): number {
    return 0
  }

  get params() {
    return this.controller.host.params
  }

  show({ resource, property, shape, viewer }: Show): unknown {
    let propertyKey: string | undefined
    let propertyShape: PropertyShape | undefined
    let path: MultiPointer | undefined
    if ('termType' in property) {
      propertyKey = property.value;
      [path] = resource.node(property).toArray()
    } else {
      path = property.pointer.out(sh.path)
      propertyKey = path?.value
      propertyShape = property
    }
    if (!propertyKey) {
      throw new Error('Missing property path term')
    }

    let propertyState = this.state.properties[propertyKey]
    const context = new PropertyRenderContext(this, resource, propertyState || { path })
    if (!propertyState) {
      propertyState = context.state
      this.state.properties[propertyKey] = propertyState
      context.initRenderer({
        viewer: propertyShape?.viewer?.id || viewer,
        shape,
        property,
      })

      if (!propertyState.render) {
        return context.show({ resource, property, shape, viewer })
      }
    }

    return propertyState.render?.() || context.show({ resource, property, shape, viewer })
  }

  findApplicableViewers(object: GraphPointer) {
    return this.viewers.findApplicableViewers({ object })
  }

  initRenderer() {
    throw new Error('Unsupported')
  }
}
