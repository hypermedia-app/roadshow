import { dash } from '@tpluscode/rdf-ns-builders/strict'
import { html } from 'lit'
import { Renderer } from '../index'

export const URI: Renderer = {
  viewer: dash.URIViewer,
  render(resource) {
    const [value] = resource.values

    return html`<a href="${value}">${value}</a>`
  },
}
