import { dash, rdfs, schema, skos } from '@tpluscode/rdf-ns-builders'
import { html } from 'lit'
import { Renderer } from '../index'

export const Label: Renderer = {
  viewer: dash.LabelViewer,
  render(resource) {
    const [label] = resource.out([rdfs.label, skos.prefLabel, schema.name], { language: '*' }).values

    return html`<a href="${resource.value}">${label || resource.value}</a>`
  },
}
