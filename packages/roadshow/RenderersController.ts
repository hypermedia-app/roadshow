import { ReactiveController } from 'lit'
import { NamedNode } from '@rdfjs/types'
import TermMap from '@rdf-esm/term-map'
import type { GraphPointer } from 'clownface'
import { Renderer, RoadshowView } from './index'
import * as defaultRenderers from './renderers'

export class RenderersController implements ReactiveController {
  static readonly defaultRenderers: Array<Renderer> = Object.values(defaultRenderers)

  private renderers: Map<NamedNode, Renderer> = new Map()

  constructor(private host: RoadshowView) {
  }

  hostConnected(): void {
    this.renderers = new TermMap([
      ...RenderersController.defaultRenderers,
      ...this.host.renderers,
    ].map(renderer => [renderer.viewer, renderer]))
  }

  get(viewer: NamedNode | undefined): Renderer['render'] {
    return (viewer && (this.renderers.get(viewer)?.render || this.__renderWarning(viewer))) || this.__renderRaw
  }

  private __renderWarning(viewer: NamedNode) {
    return (): string => `No renderer found for ${viewer?.value}`
  }

  private __renderRaw(obj: GraphPointer): string {
    return `No viewer found for ${obj.value}`
  }
}
