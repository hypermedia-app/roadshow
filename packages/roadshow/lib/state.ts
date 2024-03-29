/* eslint-disable no-use-before-define */
import { NodeShape, PropertyShape } from '@rdfine/shacl'
import { GraphPointer, MultiPointer } from 'clownface'
import { BlankNode, NamedNode, Term } from '@rdfjs/types'
import { dash, sh } from '@tpluscode/rdf-ns-builders'
import TermMap from '@rdf-esm/term-map'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import graphPointer from 'is-graph-pointer'
import type { Renderer } from './render.js'
import type { FocusNodeViewContext, ObjectViewContext, PropertyViewContext, ViewContext } from './ViewContext/index.js'
import type { Decorator } from '../index.js'
import { getAllProperties } from './shape.js'

export interface ViewerScore {
  pointer: GraphPointer<NamedNode>
  score: number | null
}

export interface RendererState<VC extends ViewContext<S>, S extends AnyState = VC['state']> {
  decorators: Array<Decorator<VC>>
  renderers: Array<Renderer<VC>>
  renderer?: Renderer<VC>
  error?: string | Error
}

export interface ObjectState<R = unknown> extends RendererState<ObjectViewContext> {
  applicableViewers: ViewerScore[]
  viewer: Term
  locals: R
  loading: Set<string>
  loadingFailed: Set<string>
}

interface ShapedNodeState<R = unknown> {
  applicableShapes: NodeShape[]
  shapesLoaded?: boolean
  loading: Set<string>
  loadingFailed: Set<string>
  locals: R
}

export interface PropertyState<R = unknown> extends ShapedNodeState<R>, RendererState<PropertyViewContext> {
  /**
   * Node Shape selected to represent the property objects
   */
  shape: NodeShape | undefined
  /**
   * The Node Shape of which the property is child
   */
  focusNodeShape: NodeShape | undefined
  /**
   * The focus node, ie. subject of the property objects
   */
  focusNode: MultiPointer | undefined
  propertyShape: PropertyShape
  path: GraphPointer
  viewer?: Term
  objects: Map<Term, ObjectState | FocusNodeState>
}

export interface FocusNodeState<R = unknown> extends ShapedNodeState<R>, RendererState<FocusNodeViewContext> {
  shape: NodeShape | undefined
  term: Term
  pointer?: GraphPointer<BlankNode | NamedNode>
  properties: PropertyState[]
  applicableViewers: ViewerScore[]
  viewer?: Term
}

export type AnyState = ObjectState | FocusNodeState | PropertyState

const createPropertyState = (focusNode: MultiPointer | undefined, focusNodeShape: NodeShape | undefined) => (arr: PropertyState[], shape: PropertyShape): PropertyState[] => {
  const path = shape.pointer.out(sh.path)
  if (!graphPointer.isGraphPointer(path)) {
    // eslint-disable-next-line no-console
    console.warn(`Skipping property ${shape.name || shape.id.value}. It does not have a valid sh:path`)
    return arr
  }

  const [shNode] = shape.pointer.out(sh.node).toArray()
  const nodeShape = graphPointer.isResource(shNode) ? fromPointer(shNode) : undefined

  return [...arr, {
    propertyShape: shape,
    shape: nodeShape,
    focusNodeShape,
    focusNode,
    path,
    objects: new TermMap(),
    viewer: shape.viewer?.id,
    renderers: [],
    decorators: [],
    applicableShapes: [],
    loading: new Set(),
    loadingFailed: new Set(),
    locals: {},
  }]
}

interface Create {
  shape?: NodeShape
  viewer?: Term
  term: Term
  pointer?: GraphPointer<NamedNode | BlankNode>
}

export function initializeProperties(shape: NodeShape | undefined, pointer: MultiPointer | undefined): PropertyState[] {
  if (!shape) {
    return []
  }

  return [...getAllProperties(shape)].reduce(createPropertyState(pointer, shape), [])
}

export function create({ term, pointer, shape, viewer = dash.DetailsViewer }: Create): FocusNodeState {
  return {
    shape,
    loading: new Set(),
    loadingFailed: new Set(),
    applicableShapes: [],
    applicableViewers: [],
    shapesLoaded: false,
    properties: initializeProperties(shape, pointer),
    viewer,
    renderers: [],
    decorators: [],
    term,
    pointer,
    locals: {},
  }
}
