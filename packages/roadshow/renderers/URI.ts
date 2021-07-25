import { dash, rdfs } from '@tpluscode/rdf-ns-builders/strict'
import { html } from 'lit'
import { Renderer } from '../index'

export const URI: Renderer = {
  viewer: dash.URIViewer,
  render(resource) {
    const label = resource.out(rdfs.label)

    return html`<a href="${resource.value}">${
      this.show({ resource: label, property: rdfs.label, viewer: dash.LabelViewer })
    }</a>`
  },
}
