/* eslint-disable no-use-before-define */
import { NodeShape, PropertyShape } from '@rdfine/shacl'
import { GraphPointer } from 'clownface'
import { BlankNode, NamedNode, Term } from '@rdfjs/types'
import { dash, sh } from '@tpluscode/rdf-ns-builders/strict'
import TermMap from '@rdf-esm/term-map'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { isResource, isGraphPointer } from './clownface'

export interface ViewerScore {
  pointer: GraphPointer<NamedNode>
  score: number | null
}
export interface ObjectState {
  applicableViewers: ViewerScore[]
  viewer: Term
}

interface ShapedNodeState {
  shape?: NodeShape
  applicableShapes: NodeShape[]
  shapesLoaded?: boolean
  loading: Set<string>
  loadingFailed: Set<string>
}

export interface PropertyState extends ShapedNodeState {
  propertyShape: PropertyShape
  path: GraphPointer
  viewer?: Term
  objects: Map<Term, ObjectState | FocusNodeState>
}

export interface FocusNodeState extends ShapedNodeState {
  term: Term
  pointer?: GraphPointer<BlankNode | NamedNode>
  properties: PropertyState[]
  applicableViewers: ViewerScore[]
  viewer: Term
}

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
    applicableShapes: [],
    loading: new Set(),
    loadingFailed: new Set(),
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
    term,
    pointer,
  }
}
