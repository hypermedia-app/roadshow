import { Renderer, ViewerMatcher } from '@hydrofoil/roadshow/index'
import { hydra, rdf } from '@tpluscode/rdf-ns-builders'
import { NamedNode } from 'rdf-js'
import { html } from 'lit'
import { FocusNodeViewContext } from '@hydrofoil/roadshow/lib/ViewContext'
import { hex } from '../lib/ns'

export const matcher: ViewerMatcher = {
  viewer: hex.PartialCollectionViewViewer,
  match({ resource }) {
    return resource.has(rdf.type, hydra.PartialCollectionView).terms.length ? 50 : 0
  },
}

export const renderer: Renderer<FocusNodeViewContext> = {
  viewer: hex.PartialCollectionViewViewer,
  render() {
    const link = (predicate: NamedNode) => {
      const property = this.state.properties.find(({ path }) => predicate.equals(path.term))
      if (property) {
        return this.show({ property })
      }

      return ''
    }

    return html`<div>
      <span>${link(hydra.first)}</span>
      <span>${link(hydra.previous)}</span>
      <span>${link(hydra.next)}</span>
      <span>${link(hydra.last)}</span>
    </div>`
  },
}
