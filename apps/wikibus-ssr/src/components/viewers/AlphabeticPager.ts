import { defineViewer } from '@hydrofoil/roadshow-ng'
import { canvas } from '../../ns'
import '../canvas-shell/canvas-pager.js'

defineViewer(canvas.AlphabeticPager, 'canvas-pager', {
  multiViewer: true,
})
