import { dash, rdfs, schema, skos } from '@tpluscode/rdf-ns-builders'
import { html } from 'lit'
import { NamedNode } from '@rdfjs/types'
import { Renderer } from '../index.js'

interface LabelRenderer extends Renderer {
  predicates: NamedNode[]
}

export const Label: LabelRenderer = {
  viewer: dash.LabelViewer,
  render(resource) {
    const [label] = resource.out(Label.predicates, { language: [this.params.language, '*'] }).values

    const labelResult = html`${label || resource.value}`

    if (resource.term?.termType === 'BlankNode') {
      return labelResult
    }

    return html`<a href="${resource.values[0]}">${labelResult}</a>`
  },
  predicates: [skos.prefLabel, skos.altLabel, schema.name, rdfs.label],
}
