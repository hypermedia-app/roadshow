import TermMap from '@rdfjs/term-map'
import type { NamedNode } from '@rdfjs/types'

interface Viewer {
  tagName: string
  dependencies?: () => Promise<void>
}

const viewers = new TermMap<NamedNode, Viewer>()

export default viewers
