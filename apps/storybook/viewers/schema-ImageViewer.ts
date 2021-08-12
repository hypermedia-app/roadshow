import { Renderer, ViewerMatcher } from '@hydrofoil/roadshow/index'
import { rdf, schema } from '@tpluscode/rdf-ns-builders/strict'
import { html } from 'lit'
import { ex } from '../lib/ns'

export const matcher: ViewerMatcher = {
  viewer: ex.SchemaImageViewer,
  match({ resource }) {
    return resource.has(rdf.type, schema.ImageObject).terms.length ? 50 : 0
  },
}

export const renderer: Renderer = {
  viewer: ex.SchemaImageViewer,
  render(image) {
    return html`<div>
        <img src="${image.out(schema.contentUrl).value || ''}" alt="${image.out(schema.caption).value || ''}">
    </div>`
  },
}
