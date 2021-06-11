import { dash } from '@tpluscode/rdf-ns-builders'
import { ViewerMatchInit } from '../index'

export const BlankNodeViewer: ViewerMatchInit = {
  viewer: dash.BlankNodeViewer,
  match({ resource }) {
    return resource.term.termType === 'BlankNode' ? 1 : 0
  },
}
