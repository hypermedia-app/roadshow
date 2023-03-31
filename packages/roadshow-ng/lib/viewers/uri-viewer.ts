import { dash } from '@tpluscode/rdf-ns-builders'
import { defineViewer } from '../defineViewer'

defineViewer(dash.URIViewer, 'a', {
  renderInner({ pointer }) {
    return pointer.value
  },
  mapAttributes: {
    href({ pointer }) {
      return pointer.value
    },
  },
})
