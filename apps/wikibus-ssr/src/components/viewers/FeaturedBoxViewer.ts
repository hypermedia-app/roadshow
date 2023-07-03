import { defineViewer } from '@hydrofoil/roadshow'
import '../canvas-shell/canvas-featured-box.js'
import { sh } from '@tpluscode/rdf-ns-builders'
import { canvas } from '../../ns'

defineViewer(canvas.FeaturedBoxViewer, 'canvas-featured-box', {
  mapAttributes: {
    center() {
      return ''
    },
    effect() {
      return ''
    },
    outline() {
      return ''
    },
    class() {
      return 'col_one_third'
    },
    icon({ shape }) {
      return shape.out(canvas.icon).value
    },
    title({ shape }) {
      return shape.out(sh.name).value
    },
    description({ shape }) {
      return shape.out(sh.description).value
    },
    href({ pointer }) {
      return pointer.value
    },
  },
})
