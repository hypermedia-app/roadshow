import * as roadshow from '@hydrofoil/roadshow-ssr'
import { loadData } from 'test-data'
import { ex } from 'test-data/ns'
import { dash } from '@tpluscode/rdf-ns-builders'
import './viewers.js'

export async function render() {
  const graph = await loadData('shape/only-header.ttl', 'example/page.ttl')
  const pointer = graph.node(ex.PageWithTitle).addOut(dash.shape, ex.HeaderOnlyShape)

  return roadshow.render({ pointer })
}
