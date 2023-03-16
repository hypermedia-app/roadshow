import TermMap from '@rdfjs/term-map'
import type { NamedNode } from '@rdfjs/types'
import { GraphPointer } from 'clownface'

export interface MultiViewer {
  renderProperty(values: GraphPointer[]): unknown
}

export interface SingleViewer {
  renderInner?(arg: { pointer: GraphPointer }): unknown
  renderElement(arg: {
    shape: GraphPointer
    pointer: GraphPointer
    innerContent?: unknown
  }) : unknown
}

export const viewers = new TermMap<NamedNode, MultiViewer | SingleViewer>()
