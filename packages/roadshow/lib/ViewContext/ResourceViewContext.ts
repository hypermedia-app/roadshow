import type { GraphPointer, MultiPointer } from 'clownface'
import { NamedNode } from 'rdf-js'
import { roadshow } from '@hydrofoil/vocabularies/builders/strict'
import { PropertyShape } from '@rdfine/shacl'
import { sh } from '@tpluscode/rdf-ns-builders/strict'
import ViewContextBase from './ViewContextBase'
import { ResourceViewState, PropertyViewState } from '../state'
import { InitRenderer, Show } from '../../index'
import { isGraphPointer, TRUE } from '../clownface'
import PropertyViewContext from './PropertyViewContext'
import { renderLoadingSlot } from '../fallbackSlots'

export default class ResourceViewContext extends ViewContextBase<ResourceViewState, PropertyViewState> {
  initState(pointer: GraphPointer<NamedNode>): ResourceViewState {
    return {
      pointer,
      properties: {},
      applicableShapes: [],
      applicableViewers: [],
      locals: {},
    }
  }

  show({ property, resource, viewer, shape }: Show): unknown {
    if (isGraphPointer(resource)) {
      // return this.parent.show({ property, resource, viewer, shape })
    }

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
    if (!propertyState) {
      const context = new PropertyViewContext(this, resource, propertyState || { path })
      propertyState = context.state
      this.state.properties[propertyKey] = propertyState
      context.initRenderer({
        viewer: viewer || propertyShape?.viewer?.id,
        shape,
        property,
      })
    }

    return propertyState!.render!()
  }

  initRenderer(overrides: InitRenderer) {
    const resource = this.state.pointer
    let propertyShape: PropertyShape | undefined
    if ('id' in overrides.property) {
      propertyShape = overrides.property
    }

    if (!(propertyShape?.pointer.out(roadshow.dereference).term?.equals(TRUE) && resource.term.termType === 'NamedNode')) {
      super.initRenderer(overrides)
      return
    }

    const objectState = this.state
    const previouslyLoaded = this.resources.get(resource.term)
    if (previouslyLoaded) {
      objectState.pointer = previouslyLoaded
      super.initRenderer(overrides)
      return
    }

    objectState.render = renderLoadingSlot
    this.resources.load?.(resource.term).then((loaded) => {
      if (loaded) {
        delete objectState.render
        this.requestUpdate()
      }
    })
  }
}
