import clownface, { GraphPointer, MultiPointer } from 'clownface'
import { html, TemplateResult } from 'lit'
import { findNodes } from 'clownface-shacl-path'
import { BlankNode, Literal, NamedNode, Term } from '@rdfjs/types'
import { roadshow } from '@hydrofoil/vocabularies/builders'
import { dash, rdf } from '@tpluscode/rdf-ns-builders'
import { sh } from '@tpluscode/rdf-ns-builders/loose'
import { dataset } from '@rdf-esm/dataset'
import { NodeShape } from '@rdfine/shacl'
import { ResourceIdentifier } from '@tpluscode/rdfine'
import graphPointer from 'is-graph-pointer'
import { create, FocusNodeState, initializeProperties, ObjectState, PropertyState, RendererState } from './state.js'
import {
  FocusNodeViewContext,
  ObjectViewContext,
  Params,
  PropertyViewContext,
  Show,
  ViewContext,
} from './ViewContext/index.js'
import type { RoadshowController } from '../RoadshowController.js'
import { TRUE } from './clownface.js'
import { Decorator } from './decorator.js'

export interface RenderFunc<VC extends ViewContext<unknown>> {
  (this: VC, resource: MultiPointer): TemplateResult | string
}

interface Render {
  state: FocusNodeState
  focusNode?: MultiPointer
  controller: RoadshowController
  params: Params
}

export interface Renderer<VC extends ViewContext<any> = ViewContext<any>> {
  readonly id: Term
  meta: GraphPointer
  viewer: Term
  render: RenderFunc<VC>
  init?: (context: VC) => Promise<void>
}

function findViewers(state: PropertyState | FocusNodeState, object: MultiPointer, { viewers, renderers }: RoadshowController) {
  if (!graphPointer.isGraphPointer(object)) {
    return {
      applicableViewers: [],
      viewer: roadshow.RendererNotFoundViewer,
    }
  }

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

function setRenderer<S extends RendererState<any>>(this: ViewContext<any>, renderer: Renderer<ViewContext<S>>) {
  this.state.renderer = renderer
  this.controller.host.requestUpdate()
}

function renderFinal(final: Pick<Renderer, 'render'>, context: ViewContext<any>) {
  const decorators = context.state.decorators as Array<Decorator<any>>

  const actualRendering = final.render.call(context, context.node)
  return decorators.reduceRight((inner, { decorate }) => decorate(inner, context), actualRendering)
}

function objectState<T extends Literal | NamedNode | BlankNode>(state: PropertyState, object: GraphPointer<T>, controller: RoadshowController): T extends Literal ? ObjectState : FocusNodeState {
  const objectState = state.objects.get(object.term)
  if (!objectState) {
    const { applicableViewers, viewer } = findViewers(state, object, controller)

    if (graphPointer.isResource(object)) {
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
      renderers: [],
      decorators: [],
      locals: {},
      loading: new Set(),
      loadingFailed: new Set(),
    }

    state.objects.set(object.term, newState)
    return newState as any
  }

  return objectState as any
}

function setShape(this: FocusNodeViewContext, shape: NodeShape | ResourceIdentifier) {
  const found = this.state.applicableShapes.find(ns => ns.equals(shape))
  if (found) {
    this.state.shape = found
    delete this.state.viewer
    delete this.state.renderer

    let { applicableViewers, viewer } = findViewers(this.state, this.node, this.controller)
    const dashViewer: NamedNode = found.pointer.out(dash.viewer).term as any
    if (dashViewer) {
      const hasRenderer = this.controller.renderers.has(dashViewer)
      if (hasRenderer) {
        viewer = dashViewer
        applicableViewers.unshift({
          pointer: this.controller.viewers.get(dashViewer),
          score: null,
        })
      }
    }

    this.state.applicableViewers = applicableViewers
    this.state.viewer = viewer
    this.state.properties = initializeProperties(found, this.node)
    this.controller.host.requestUpdate()
  }
}

function createChildContext<T extends Term>(parent: ViewContext<any>, state: any, pointer: GraphPointer<T>) : ObjectViewContext | FocusNodeViewContext {
  if (graphPointer.isResource(pointer)) {
    const childState = objectState<NamedNode | BlankNode>(state, pointer, parent.controller)

    return {
      type: 'object',
      isFocusNode: true,
      depth: parent.depth + 1,
      params: parent.params,
      controller: parent.controller,
      node: childState.pointer || pointer,
      show: showProperty,
      setRenderer,
      setShape,
      state: childState,
      parent: state,
    }
  }

  const childState = objectState<Literal>(state, pointer as any, parent.controller)
  return <ObjectViewContext>{
    type: 'object',
    isFocusNode: false,
    depth: parent.depth + 1,
    controller: parent.controller,
    params: parent.params,
    state: childState,
    node: pointer,
    parent: state,
    setRenderer,
  }
}

function renderMultiRenderObject(this: PropertyViewContext, ...args: Parameters<PropertyViewContext['object']>) {
  const [object, render] = args
  const childContext = createChildContext(this, this.state, object)

  if (childContext.isFocusNode && render?.resource) {
    return render.resource.call(childContext)
  }

  if (!childContext.isFocusNode) {
    const renderer = this.controller.initRenderer(childContext)
    const result = renderFinal(renderer, childContext)
    if (render?.literal) {
      return render.literal.call(childContext, result)
    }

    return result
  }

  return ''
}

function renderPropertyObjectsIndividually(parent: PropertyViewContext) {
  return (object: GraphPointer) => {
    const context = createChildContext(parent, parent.state, object)
    if (!context.state.viewer) {
      return 'No viewer found'
    }

    const renderer = parent.controller.initRenderer(context)

    if (context.isFocusNode) {
      parent.controller.initShapes(context.state, object)
    }

    return renderFinal(renderer, context)
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
  if (!this.state.properties.length) {
    this.state.properties = initializeProperties(this.state.shape, this.state.pointer)
  }

  const property = this.state.properties.find(propertyStateTo(show))

  if (!property) {
    this.state.error = 'Property not found in state'
    this.state.viewer = roadshow.ErrorRenderer
    const renderer = this.controller.initRenderer(this)
    return renderFinal(renderer, this)
  }

  let objects = property.propertyShape.pointer.out(sh.values)
  if (!objects.terms.length) {
    objects = findNodes(this.node, property.path)
  }

  if (show.viewer) {
    property.viewer = show.viewer
  }

  const { maxCount, class: clas, datatype } = property.propertyShape
  const filteredPointers = objects
    .filter((obj) => {
      if (clas) {
        return !!obj.has(rdf.type, clas.id).term
      }
      if (datatype) {
        return graphPointer.isLiteral(obj) && obj.term.datatype.equals(datatype.id)
      }

      return true
    })
    .filter((obj, index) => (!maxCount || maxCount > index))

  if (!(property.viewer && this.controller.viewers.isMultiViewer(property.viewer))) {
    const propertyContext: PropertyViewContext = {
      type: 'property',
      isFocusNode: false,
      depth: this.depth,
      controller: this.controller,
      params: this.params,
      state: property,
      node: filteredPointers,
      object: renderMultiRenderObject,
      parent: this.state,
      setRenderer,
    }

    this.controller.initRenderer(propertyContext)
    return renderFinal({
      render: () => html`${filteredPointers.map(renderPropertyObjectsIndividually(propertyContext))}`,
    }, propertyContext)
  }

  if (filteredPointers.toArray().length === 0) {
    return ''
  }

  this.controller.initShapes(property, filteredPointers)

  const context: PropertyViewContext = {
    type: 'property',
    isFocusNode: false,
    depth: this.depth,
    controller: this.controller,
    params: this.params,
    state: property,
    node: filteredPointers,
    object: renderMultiRenderObject,
    parent: this.state,
    setRenderer,
  }

  const renderer = this.controller.initRenderer(context)
  return renderFinal(renderer, context)
}

function renderState({ state, focusNode, controller, params }: Required<Render>): TemplateResult | string {
  const context: FocusNodeViewContext = {
    type: 'focusNode',
    isFocusNode: true,
    depth: 0,
    state,
    params,
    controller,
    node: focusNode,
    show: showProperty,
    setRenderer,
    setShape,
    parent: undefined,
  }

  const renderer = controller.initRenderer(context)
  return renderFinal(renderer, context)
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
