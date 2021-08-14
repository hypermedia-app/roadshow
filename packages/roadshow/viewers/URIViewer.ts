import { dash } from '@tpluscode/rdf-ns-builders'
import { ViewerMatcher } from '../index'

export const URIViewer: ViewerMatcher = {
  viewer: dash.URIViewer,
  match({ resource }) {
    return resource.term.termType === 'NamedNode' ? 1 : 0
  },
}
