import { dash } from '@tpluscode/rdf-ns-builders'
import { html } from 'lit'
import { defineViewer } from '../defineViewer.js'

defineViewer(dash.LiteralViewer, 'span', {
  renderInner({ pointer }) {
    return html`${pointer.value}`
  },
})
