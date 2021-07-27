import type { MultiPointer } from 'clownface'
import { GraphPointer } from 'clownface'
import { PropertyShape } from '@rdfine/shacl'
import { findNodes } from 'clownface-shacl-path'
import RenderContext from './RenderContext'
import { NodeViewState, PropertyViewState } from './state'
import { InitRenderer, Show } from '../index'
import { isGraphPointer } from './clownface'
import { create } from './context'

export default class PropertyRenderContext extends RenderContext<PropertyViewState, NodeViewState, MultiPointer> {
  initState(): PropertyViewState {
    return {
      pointer: null as never,
      applicableViewers: [],
      objects: {},
    }
  }

  show({ resource, viewer, property, shape }: Show): unknown {
    let propertyShape: PropertyShape | undefined
    if (!('termType' in property)) {
      propertyShape = property
    }

    if (!isGraphPointer(resource)) {
      return this.parent.show({ resource, viewer, property, shape })
    }

    let objectState = this.state.objects[resource.term.value]

    if (objectState?.render) {
      return objectState.render()
    }

    if (!objectState) {
      const childContext = create(this, resource)
      objectState = childContext.state
      this.state.objects[resource.term.value] = objectState
    }

    if (!objectState.render) {
      const childContext = create(this, resource, objectState)
      objectState = childContext.state

      childContext.initRenderer({
        viewer: propertyShape?.viewer?.id || viewer,
        property,
        shape,
      })
    }

    return objectState.render!()
  }

  initRenderer({ viewer, shape, property }: InitRenderer): void {
    const resource = findNodes(this.parent.state.pointer, this.state.path!)

    if (!isGraphPointer(resource)) {
      if (!this.state.render) {
        this.state.applicableViewers = this.viewers.findApplicableViewers({ object: resource, state: this.state })
        this.state.viewer = this.state.applicableViewers[0]?.pointer

        if (this.state.viewer) {
          this.state.render = () => {
            const render: any = this.renderers.get(this.state.viewer?.term)
            return render.call(this, resource)
          }
        }
      }
    }
  }

  findApplicableViewers(object: GraphPointer) {
    return this.viewers.findApplicableViewers({ object, state: this.state })
  }
}
