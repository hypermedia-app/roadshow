import clownface, { GraphPointer, MultiPointer } from 'clownface'
import { html, TemplateResult } from 'lit'
import { findNodes } from 'clownface-shacl-path'
import { BlankNode, Literal, NamedNode, Term } from '@rdfjs/types'
import { roadshow } from '@hydrofoil/vocabularies/builders'
import { rdfs, sh } from '@tpluscode/rdf-ns-builders/strict'
import { dataset } from '@rdf-esm/dataset'
import { create, FocusNodeState, ObjectState, PropertyState } from './state'
import {
  FocusNodeViewContext,
  ObjectViewContext,
  Params,
  PropertyViewContext,
  Show,
  ViewContext,
} from './ViewContext/index'
import type { RoadshowController } from '../RoadshowController'
import { isLiteral, isResource, TRUE } from './clownface'

interface Render {
  state: FocusNodeState
  focusNode?: MultiPointer
  controller: RoadshowController
  params: Params
}

function findViewers(state: PropertyState, object: GraphPointer, { viewers, renderers }: RoadshowController) {
  let applicableViewers = viewers.findApplicableViewers(object)
  if (state.viewer && !viewers.isMultiViewer(state.viewer)) {
    applicableViewers = [
      { pointer: viewers.get(state.viewer), score: null },
      ...applicableViewers.filter(match => !match.pointer.term.equals(state.viewer)),
    ]
  }

  const viewer = applicableViewers.find(vr => renderers.has(vr.pointer.term))?.pointer.term || roadshow.RendererNotFoundViewer

  return { applicableViewers, viewer }
}

function objectState<T extends Literal | NamedNode | BlankNode>(state: PropertyState, object: GraphPointer<T>, controller: RoadshowController): T extends Literal ? ObjectState : FocusNodeState {
  const objectState = state.objects.get(object.term)
  if (!objectState) {
    const { applicableViewers, viewer } = findViewers(state, object, controller)

    if (isResource(object)) {
      const newState: FocusNodeState = {
        ...create({ ...state, term: object.term, pointer: object }),
        applicableViewers,
        viewer,
      }
      if (TRUE.equals(state.propertyShape?.pointer.out(roadshow.dereference).term)) {
        delete newState.pointer
        controller.resources.loadToState(newState)
      }
      state.objects.set(object.term, newState)
      return newState as any
    }

    const newState: ObjectState = {
      applicableViewers,
      viewer,
      locals: {},
    }

    state.objects.set(object.term, newState)
    return newState as any
  }

  return objectState as any
}

function createChildContext<T extends Term>(parent: ViewContext<any>, state: any, pointer: GraphPointer<T>) : T extends Literal ? ObjectViewContext : FocusNodeViewContext {
  if (isResource(pointer)) {
    const childState = objectState<NamedNode | BlankNode>(state, pointer, parent.controller)

    return <FocusNodeViewContext>{
      depth: parent.depth + 1,
      params: parent.params,
      controller: parent.controller,
      node: pointer,
      show: showProperty,
      state: childState,
      parent: state,
      rendererState: {},
    } as any
  }

  const childState = objectState<Literal>(state, pointer as any, parent.controller)
  return <ObjectViewContext>{
    depth: parent.depth + 1,
    controller: parent.controller,
    params: parent.params,
    state: childState,
    node: pointer,
    parent: state,
    rendererState: {},
  } as any
}

function renderMultiRenderObject(this: PropertyViewContext, ...args: Parameters<PropertyViewContext['object']>) {
  const [object, render] = args

  if (isResource(object) && render?.resource) {
    return render.resource.call(createChildContext(this, this.state, object))
  }

  if (isLiteral(object)) {
    const childContext = createChildContext(this, this.state, object)
    const renderer = this.controller.renderers.get(childContext.state)
    const result = renderer.call(childContext, object)
    if (render?.literal) {
      return render.literal.call(childContext, result)
    }

    return result
  }

  return ''
}

function renderPropertyObjectsIndividually(parent: FocusNodeViewContext, property: PropertyState) {
  return (object: GraphPointer) => {
    const context = createChildContext(parent, property, object)
    if (!context.state.viewer) {
      return 'No viewer found'
    }

    const renderer = parent.controller.renderers.get(context.state)

    if ('properties' in context.state) {
      parent.controller.shapes.loadShapes(context.state, object)
    }

    if ('pointer' in context.state) {
      return renderer.call(context, context.state.pointer || object)
    }

    return renderer.call(context, object)
  }
}

function propertyStateTo(show: Show) {
  return (property: PropertyState) => {
    if ('id' in show.property) {
      return property.propertyShape.equals(show.property)
    }

    if ('termType' in show.property) {
      return property.propertyShape.pointer.has(sh.path, show.property).term
    }

    return property === show.property
  }
}

function showProperty(this: FocusNodeViewContext, show: Show) {
  const property = this.state.properties.find(propertyStateTo(show))

  if (!property) {
    const details = clownface({ dataset: dataset() })
      .blankNode()
      .addOut(rdfs.label, 'Property not found in state')
    return this.controller.renderers.get({ viewer: roadshow.ErrorRenderer }).call(this, details)
  }

  const objects = findNodes(this.node, property.path)
  if (property.viewer && this.controller.viewers.isMultiViewer(property.viewer)) {
    this.controller.shapes.loadShapes(property, objects)

    const renderer = this.controller.renderers.get(property)

    const context: PropertyViewContext = {
      depth: this.depth,
      controller: this.controller,
      params: this.params,
      state: property,
      node: objects,
      object: renderMultiRenderObject,
      parent: this.state,
    }
    return renderer.call(context, objects)
  }

  return html`${objects.map(renderPropertyObjectsIndividually(this, property))}`
}

function renderState({ state, focusNode, controller, params }: Required<Render>): TemplateResult | string {
  const renderer = controller.renderers.get(state)

  const context: FocusNodeViewContext = {
    depth: 0,
    state,
    params,
    controller,
    node: focusNode,
    show: showProperty,
    parent: undefined,
  }

  return renderer.call(context, focusNode)
}

export function render({ focusNode, ...rest }: Render): TemplateResult | string {
  if (focusNode) {
    return renderState({ focusNode, ...rest })
  }

  const pointer = clownface({ dataset: dataset() }).blankNode()
  return renderState({
    ...rest,
    focusNode: pointer,
    state: create({
      pointer,
      term: pointer.term,
      viewer: roadshow.LoadingViewer,
    }),
  })
}
