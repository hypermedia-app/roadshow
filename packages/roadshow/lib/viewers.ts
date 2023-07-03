import TermMap from '@rdfjs/term-map'
import type { NamedNode } from '@rdfjs/types'
import { GraphPointer, MultiPointer } from 'clownface'

interface Viewer<T> {
  renderInner?(arg: { pointer: T; shape?: GraphPointer }): unknown
  renderElement(arg: {
    shape: GraphPointer
    pointer: T
    innerContent?: unknown
  }) : unknown
}

export interface SingleViewer extends Viewer<GraphPointer> {
  multiViewer?: false
}
export interface MultiViewer extends Viewer<MultiPointer> {
  multiViewer: true
}

export const viewers = new TermMap<NamedNode, MultiViewer | SingleViewer>()
