import { ReactiveController } from 'lit'
import { Term } from '@rdfjs/types'
import TermMap from '@rdf-esm/term-map'
import { Renderer, RenderFunc } from './index'
import * as defaultRenderers from './renderers'

export class RenderersController implements ReactiveController {
  static readonly defaultRenderers: Array<Renderer<any>> = Object.values(defaultRenderers)
  private renderers: Map<Term, Renderer> = new Map()

  constructor() {
    this.renderers = new TermMap()
    this.set(RenderersController.defaultRenderers)
  }

  hostConnected(): void {
    //
  }

  set(renderers: Renderer[]): void {
    for (const renderer of renderers) {
      this.renderers.set(renderer.viewer, renderer)
    }
  }

  get(viewer: Term): RenderFunc<any> {
    const renderer = this.renderers.get(viewer)
    if (!renderer) {
      return () => ''
    }

    return renderer.render
  }
}
