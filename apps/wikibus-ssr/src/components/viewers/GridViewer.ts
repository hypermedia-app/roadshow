import { defineViewer } from '@hydrofoil/roadshow-ng'
import { hex } from '@hydrofoil/vocabularies/builders'
import '@appnest/masonry-layout'

defineViewer(hex.GridViewer, 'masonry-layout', {
  multiViewer: true,
  mapAttributes: {
    class() {
      return 'grid-container clearfix'
    },
  },
  mapStyle() {
    return {
      '--portfolio-image-height': '200px',
    }
  },
})
