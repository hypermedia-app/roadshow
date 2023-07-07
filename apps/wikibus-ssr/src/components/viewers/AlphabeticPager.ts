import { defineViewer } from '@hydrofoil/roadshow'
import { canvas } from '../../ns.js'
import '../canvas-shell/canvas-pager.js'

defineViewer(canvas.AlphabeticPager, 'canvas-pager', {
  multiViewer: true,
})
