/* eslint-disable no-use-before-define */
import { NodeShape, PropertyShape } from '@rdfine/shacl'
import { GraphPointer } from 'clownface'
import { BlankNode, NamedNode, Term } from '@rdfjs/types'
import { dash, sh } from '@tpluscode/rdf-ns-builders/strict'
import TermMap from '@rdf-esm/term-map'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { isResource, isGraphPointer } from './clownface'
import type { Renderer } from './render'
import type { FocusNodeViewContext, ObjectViewContext, PropertyViewContext, ViewContext } from './ViewContext/index'
import type { Decorator } from '../index'

export interface ViewerScore {
  pointer: GraphPointer<NamedNode>
  score: number | null
}

export interface RendererState<VC extends ViewContext<S>, S extends AnyState = VC['state']> {
  decorators: Array<Decorator<VC>>
  renderers: Array<Renderer<VC>>
  renderer?: Renderer<VC>
}

export interface ObjectState<R = unknown> extends RendererState<ObjectViewContext> {
  applicableViewers: ViewerScore[]
  viewer: Term
  locals: R
  loading: Set<string>
  loadingFailed: Set<string>
}

interface ShapedNodeState<R = unknown> {
  shape?: NodeShape
  applicableShapes: NodeShape[]
  shapesLoaded?: boolean
  loading: Set<string>
  loadingFailed: Set<string>
  locals: R
}

export interface PropertyState<R = unknown> extends ShapedNodeState<R>, RendererState<PropertyViewContext> {
  propertyShape: PropertyShape
  path: GraphPointer
  viewer?: Term
  objects: Map<Term, ObjectState | FocusNodeState>
}

export interface FocusNodeState<R = unknown> extends ShapedNodeState<R>, RendererState<FocusNodeViewContext> {
  term: Term
  pointer?: GraphPointer<BlankNode | NamedNode>
  properties: PropertyState[]
  applicableViewers: ViewerScore[]
  viewer: Term
}

export type AnyState = ObjectState | FocusNodeState | PropertyState

export function createPropertyState(arr: PropertyState[], shape: PropertyShape): PropertyState[] {
  const path = shape.pointer.out(sh.path)
  if (!isGraphPointer(path)) {
    // eslint-disable-next-line no-console
    console.warn(`Skipping property ${shape.name || shape.id.value}. It does not have a valid sh:path`)
    return arr
  }

  const [shNode] = shape.pointer.out(sh.node).toArray()
  const nodeShape = isResource(shNode) ? fromPointer(shNode) : undefined

  return [...arr, {
    propertyShape: shape,
    shape: nodeShape,
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

export function create({ term, pointer, shape, viewer = dash.DetailsViewer }: Create): FocusNodeState {
  return {
    shape,
    loading: new Set(),
    loadingFailed: new Set(),
    applicableShapes: [],
    applicableViewers: [],
    shapesLoaded: false,
    properties: shape?.property.reduce(createPropertyState, []) || [],
    viewer,
    renderers: [],
    decorators: [],
    term,
    pointer,
    locals: {},
  }
}
