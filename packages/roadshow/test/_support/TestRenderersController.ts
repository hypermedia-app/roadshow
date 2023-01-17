import TermMap from '@rdf-esm/term-map'
import { NamedNode } from '@rdfjs/types'
import { Renderer, RenderFunc } from '../../index.js'

export class TestRenderersController {
  private renderers: Map<NamedNode, Renderer<any>>

  constructor(renderers: Array<[NamedNode, RenderFunc<any>]>) {
    this.renderers = new TermMap(renderers.map(([viewer, render]) => [viewer, { viewer, render }]))
  }

  get(state: { viewer: NamedNode }) {
    return this.renderers.get(state.viewer)!
  }

  has(viewer: NamedNode): boolean {
    return this.renderers.has(viewer)
  }

  hostConnected(): void {
    //
  }

  set(viewer: NamedNode, render: RenderFunc<any>): void {
    this.renderers.set(viewer, { viewer, render })
  }
}
