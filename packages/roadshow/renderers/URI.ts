import { dash } from '@tpluscode/rdf-ns-builders'
import { html } from 'lit'
import { Renderer } from '../index'

export const URI: Renderer = {
  viewer: dash.URIViewer,
  render(resource) {
    return html`<a href="${resource.value}">${resource.value}</a>`
  },
}
