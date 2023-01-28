import TermMap from '@rdfjs/term-map'
import type { NamedNode } from '@rdfjs/types'
import { GraphPointer } from 'clownface'

export interface SingleViewer {
  renderTerm(pointer: GraphPointer): unknown
}

export interface MultiViewer {
  renderProperty(values: GraphPointer[]): unknown
}

export interface FocusNodeViewer {
  renderFocusNode(pointer: GraphPointer, innerContent?: unknown) : unknown
}

export const viewers = new TermMap<NamedNode, SingleViewer | MultiViewer | FocusNodeViewer>()
