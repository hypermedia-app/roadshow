import clownface, { GraphPointer, MultiPointer } from 'clownface'
import { html, TemplateResult } from 'lit'
import { findNodes } from 'clownface-shacl-path'
import { BlankNode, Literal, NamedNode, Term } from '@rdfjs/types'
import { roadshow } from '@hydrofoil/vocabularies/builders'
import { dataset } from '@rdf-esm/dataset'
import { create, FocusNodeState, ObjectState, PropertyState } from './state'
import {
  FocusNodeViewContext,
  ObjectViewContext,
  PropertyViewContext,
  ViewContext,
} from './ViewContext/index'
import { RoadshowController } from '../RoadshowController'
import { isLiteral, isResource, TRUE } from './clownface'
import { ViewersController } from '../ViewersController'

interface Render {
  state: FocusNodeState
  focusNode?: MultiPointer
  controller: RoadshowController
}

function findViewers(state: PropertyState, object: GraphPointer, viewers: ViewersController) {
  let applicableViewers = viewers.findApplicableViewers(object)
  if (state.viewer) {
    applicableViewers = [
      { pointer: viewers.get(state.viewer), score: null },
      ...applicableViewers.filter(match => !match.pointer.term.equals(state.viewer)),
    ]
  }

  return applicableViewers
}

function objectState<T extends Literal | NamedNode | BlankNode>(state: PropertyState, object: GraphPointer<T>, controller: RoadshowController): T extends Literal ? ObjectState : FocusNodeState {
  const objectState = state.objects.get(object.term)
  if (!objectState) {
    const applicableViewers = findViewers(state, object, controller.viewers)
    const viewer = applicableViewers[0].pointer.term

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
    } as any
  }

  const childState = objectState<Literal>(state, pointer as any, parent.controller)
  return <ObjectViewContext>{
    depth: parent.depth + 1,
    controller: parent.controller,
    params: parent.params,
    state: childState,
    node: pointer,
  } as any
}

function showProperty(this: FocusNodeViewContext, { property }: { property: PropertyState }) {
  if (!this.state.properties.find(p => p === property)) {
    // eslint-disable-next-line no-console
    console.warn('Property not found in state')
    return ''
  }

  const objects = findNodes(this.node, property.path)
  if (property.viewer && this.controller.viewers.isMultiViewer(property.viewer)) {
    this.controller.shapes.loadShapes(property, objects)

    const renderer = this.controller.renderers.get(property)

    const context: PropertyViewContext = {
      depth: this.depth + 1,
      controller: this.controller,
      params: this.params,
      state: property,
      node: objects,
      object(object, render) {
        if (isResource(object) && render.resource) {
          const context = createChildContext(this, this.state, object)
          if (!context.state.shape) {
            context.state.shape = property.shape
          }

          return render.resource.call(context)
        }

        if (isLiteral(object) && render.literal) {
          return 'literal rendered'
        }

        return ''
      },
    }
    return renderer.call(context, objects)
  }

  return html`${objects.map((object) => {
    const context = createChildContext(this, property, object)
    if (!context.state.viewer) {
      return 'No viewer found'
    }

    const renderer = this.controller.renderers.get(context.state)

    if ('properties' in context.state) {
      this.controller.shapes.loadShapes(context.state, object)
    }

    if ('pointer' in context.state) {
      return renderer.call(context, context.state.pointer || object)
    }

    return renderer.call(context, object)
  })}`
}

function renderState({ state, focusNode, controller }: Required<Render>): TemplateResult | string {
  const renderer = controller.renderers.get(state)

  const context: FocusNodeViewContext = {
    depth: 0,
    state,
    params: {},
    controller,
    node: focusNode,
    show: showProperty,
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
