import { defineViewer, html } from '@hydrofoil/roadshow-ng'
import { hex } from '@hydrofoil/vocabularies/builders'
import { rdfs } from '@tpluscode/rdf-ns-builders'
import { canvas } from '../../ns'

defineViewer(canvas.AlphabeticPager, 'canvas-pager', {
  renderInner(view) {
    const links = view.pointer.out(hex.page)
      .map(link => ({ href: link.value, label: link.out(rdfs.label).value || '_' }))
      .sort((l, r) => l.label.localeCompare(r.label))

    return html`<canvas-pager .links="${links}"></canvas-pager>`
  },
})
