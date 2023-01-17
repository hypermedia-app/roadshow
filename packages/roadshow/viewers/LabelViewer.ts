import { dash } from '@tpluscode/rdf-ns-builders'
import { ViewerMatcher } from '../index.js'

export const LabelViewer: ViewerMatcher = {
  viewer: dash.LabelViewer,
  match({ resource }) {
    return resource.term.termType === 'NamedNode' ? 5 : 0
  },
}
