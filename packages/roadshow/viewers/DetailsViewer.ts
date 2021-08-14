import { dash } from '@tpluscode/rdf-ns-builders'
import { ViewerMatcher } from '../index'

export const DetailsViewer: ViewerMatcher = {
  viewer: dash.DetailsViewer,
  match({ resource }) {
    return resource.term.termType === 'BlankNode' || resource.term.termType === 'NamedNode' ? null : 0
  },
}
