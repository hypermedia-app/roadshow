import { dash } from '@tpluscode/rdf-ns-builders'
import { ViewerMatcher } from '../index'

export const BlankNodeViewer: ViewerMatcher = {
  viewer: dash.BlankNodeViewer,
  match({ resource }) {
    return resource.term.termType === 'BlankNode' ? 1 : 0
  },
}
