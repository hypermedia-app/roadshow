import { dash } from '@tpluscode/rdf-ns-builders'
import { GraphPointer } from 'clownface'
import { html } from 'lit'
import { defineViewer } from '../defineViewer.js'

defineViewer(dash.LiteralViewer, {
  renderTerm(term: GraphPointer) {
    return html`${term.value}`
  },
})
