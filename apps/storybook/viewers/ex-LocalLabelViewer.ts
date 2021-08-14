import { MultiPointer } from 'clownface'
import { MultiRenderer } from '@hydrofoil/roadshow/index'
import { isLiteral } from '@hydrofoil/roadshow/lib/clownface'
import { ViewersController } from '@hydrofoil/roadshow/ViewersController'
import { dash, rdf } from '@tpluscode/rdf-ns-builders/strict'
import { ex } from '../lib/ns'

ViewersController.viewerMeta
  .node(ex.LocalLabelViewer)
  .addOut(rdf.type, dash.MultiViewer)

export const localizedLabel: MultiRenderer = {
  viewer: ex.LocalLabelViewer,
  render(resources: MultiPointer) {
    const arr = resources.toArray().filter(isLiteral)
    const label = arr.find(r => r.term.language === this.params.language) || arr.find(r => r.term.language === 'en')

    if (!label) {
      return ''
    }

    return this.object(label)
  },
}
