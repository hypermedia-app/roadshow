import { GraphPointer, MultiPointer } from 'clownface'
import { html, TemplateResult } from 'lit'
import { findNodes } from 'clownface-shacl-path'
import { BlankNode, Literal, NamedNode, Term } from '@rdfjs/types'
import { create, FocusNodeState, ObjectState, PropertyState } from './state'
import {
  FocusNodeViewContext,
  ObjectViewContext,
  PropertyViewContext,
  ViewContext,
} from './ViewContext/index'
import { RoadshowController } from '../RoadshowController'
import { isLiteral, isResource } from './clownface'
import { ViewersController } from '../ViewersController'

interface Render {
  state: FocusNodeState
  focusNode: MultiPointer
  controller: RoadshowController
}

function objectState<T extends Literal | NamedNode | BlankNode>(state: PropertyState, object: GraphPointer<T>, viewers: ViewersController): T extends Literal ? ObjectState : FocusNodeState {
  const objectState = state.objects.get(object.term)
  if (!objectState) {
    let newState: ObjectState | FocusNodeState

    let applicableViewers = viewers.findApplicableViewers(object)
    if (state.viewer) {
      applicableViewers = [
        { pointer: viewers.get(state.viewer), score: null },
        ...applicableViewers.filter(match => !match.pointer.term.equals(state.viewer)),
      ]
    }

    const [viewer] = applicableViewers

    if (object.term.termType === 'Literal') {
      newState = {
        applicableViewers,
        viewer: viewer.pointer.term,
      }
    } else {
      newState = {
        ...create(state),
        applicableViewers,
        viewer: viewer.pointer.term,
      }
    }

    state.objects.set(object.term, newState)
    return newState as any
  }

  return objectState as any
}

function createChildContext<T extends Term>(parent: ViewContext<any>, state: any, pointer: GraphPointer<T>) : T extends Literal ? ObjectViewContext : FocusNodeViewContext {
  if (isResource(pointer)) {
    const childState = objectState<NamedNode | BlankNode>(state, pointer, parent.controller.viewers)

    return <FocusNodeViewContext>{
      depth: parent.depth + 1,
      params: parent.params,
      controller: parent.controller,
      node: pointer,
      show: showProperty,
      state: childState,
    } as any
  }

  const childState = objectState<Literal>(state, pointer as any, parent.controller.viewers)
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
    const renderer = this.controller.renderers.get(property.viewer)
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
            this.controller.shapes.loadShapes(context.state, object)
            return ''
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

    const renderer = this.controller.renderers.get(context.state.viewer)

    if ('properties' in context.state) {
      this.controller.shapes.loadShapes(context.state, object)
    }

    return renderer.call(context, object)
  })}`
}

export function render({ state, focusNode, controller }: Render): TemplateResult | string {
  const renderer = controller.renderers.get(state.viewer)

  controller.shapes.loadShapes(state, focusNode)

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
