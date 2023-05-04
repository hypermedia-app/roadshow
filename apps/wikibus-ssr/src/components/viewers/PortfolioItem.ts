import { defineViewer } from '@hydrofoil/roadshow-ng'
import { schema } from '@tpluscode/rdf-ns-builders'
import { canvas } from '../../ns.js'
import '../canvas-shell/canvas-portfolio-item.js'

defineViewer(canvas.PortfolioItem, 'canvas-portfolio-item', {
  mapAttributes: {
    'resource-id'({ pointer }) {
      return pointer.value
    },
    image({ pointer }) {
      return pointer.out(schema.image).out(schema.contentUrl).value
    },
  },
})
