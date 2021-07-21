import type { NodeShape, PropertyShape } from '@rdfine/shacl'
import type { NamedNode } from '@rdfjs/types'
import type { GraphPointer } from 'clownface'
import type { TemplateResult } from 'lit'
import type { ViewerScore } from '../ViewersController'

interface CoreState {
  pointer: GraphPointer
  applicableViewers: ViewerScore[]
  viewer?: GraphPointer<NamedNode>
  render?(): TemplateResult | string
}

export interface PropertyViewState {
  shape?: PropertyShape
  objects: Record<string, CoreState>
}

export interface NodeViewState extends CoreState {
  shape: NodeShape
  applicableShapes: NodeShape[]
  properties: Record<string, PropertyViewState>
}

export type ViewState = PropertyViewState | NodeViewState
