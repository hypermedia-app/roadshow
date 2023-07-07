import { defineViewer } from '@hydrofoil/roadshow'
import { dash } from '@tpluscode/rdf-ns-builders'

defineViewer(dash.ImageViewer, 'img', {
  mapAttributes: {
    src({ pointer }) {
      return pointer.value
    },
  },
})
