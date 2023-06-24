import { defineViewer } from '@hydrofoil/roadshow-ng'
import { hex } from '@hydrofoil/vocabularies/builders'
import { isServer } from 'lit'

defineViewer(hex.GridViewer, 'masonry-layout', {
  multiViewer: true,
  oneTimeInit() {
    if (!isServer) import('@appnest/masonry-layout')
  },
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
