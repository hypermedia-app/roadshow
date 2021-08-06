import type { MultiPointer } from 'clownface'
import { GraphPointer } from 'clownface'
import { findNodes } from 'clownface-shacl-path'
import { dash, rdf, sh } from '@tpluscode/rdf-ns-builders'
import ViewContextBase from './ViewContextBase'
import { ResourceViewState, PropertyViewState } from '../state'
import { InitRenderer, MultiRenderer, Show } from '../../index'
import { isGraphPointer } from '../clownface'

export default class PropertyViewContext extends ViewContextBase<PropertyViewState, ResourceViewState, MultiPointer> {
  initState(): PropertyViewState {
    return {
      pointer: null as never,
      applicableViewers: [],
      objects: {},
      locals: {},
    }
  }

  show({ resource, viewer, property, shape }: Show): unknown {
    if (!('termType' in property)) {
      this.state.shape = property
    }

    if (!isGraphPointer(resource)) {
      return this.parent.show({ resource, viewer, property, shape })
    }

    let objectState = this.state.objects[resource.term.value]

    if (objectState?.render) {
      return objectState.render()
    }

    if (!objectState) {
      const childContext = this.create(this, resource)
      objectState = childContext.state
      this.state.objects[resource.term.value] = objectState
    }

    if (!objectState.render) {
      const childContext = this.create(this, resource, objectState)
      objectState = childContext.state

      childContext.initRenderer({
        viewer: this.state.shape?.viewer?.id || viewer,
        property,
        shape,
      })
    }

    return objectState.render!()
  }

  initRenderer({ viewer, shape, property }: InitRenderer): void {
    const resource = findNodes(this.parent.state.pointer, this.state.path!)
    const propertyShape = 'termType' in property
      ? shape?.property.find(propShape => propShape.pointer.has(sh.path, property).term)
      : property

    if (this.state.render) {
      return
    }

    const multiViewer = viewer || propertyShape?.viewer?.id
    const pointer = multiViewer ? this.viewers.get(multiViewer) : undefined
    const isMultiViewer = pointer?.has(rdf.type, dash.MultiViewer).term

    if (isGraphPointer(resource) || !isMultiViewer) {
      return
    }

    if (pointer && isMultiViewer) {
      this.state.viewer = pointer
    }

    const render: MultiRenderer['render'] = this.renderers.get(this.state.viewer?.term)
    if (this.state.viewer && render) {
      this.state.render = () => render.call(this, resource)
    }
  }

  findApplicableViewers(object: GraphPointer) {
    return this.viewers.findApplicableViewers({ object, state: this.state })
  }
}
