import { dash, rdfs } from '@tpluscode/rdf-ns-builders'
import { html } from 'lit'
import { defineViewer } from '../defineViewer.js'

defineViewer(dash.LabelViewer, 'a', {
  mapAttributes: {
    href({ pointer }) {
      return pointer.value
    },
  },
  renderInner({ pointer }) {
    return html`${pointer.out(rdfs.label).value}`
  },
})
