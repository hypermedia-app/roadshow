import { dash, rdfs, schema, skos } from '@tpluscode/rdf-ns-builders'
import { html } from 'lit'
import { Renderer } from '../index'

export const Label: Renderer = {
  viewer: dash.LabelViewer,
  render(resource) {
    const [label] = resource.out([rdfs.label, skos.prefLabel, schema.name], { language: [this.params.language, '*'] }).values

    const labelResult = html`${label || resource.value}`

    if (resource.term?.termType === 'BlankNode') {
      return labelResult
    }

    return html`<a href="${resource.values[0]}">${labelResult}</a>`
  },
}
