import { dash, rdf } from '@tpluscode/rdf-ns-builders'
import { ViewerMatcher } from '../index'

export const HTMLViewer: ViewerMatcher = {
  viewer: dash.HTMLViewer,
  match({ resource }) {
    return resource.term.termType === 'Literal' && resource.term.datatype.equals(rdf.HTML) ? 50 : 0
  },
}
