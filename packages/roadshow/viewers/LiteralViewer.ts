import { dash } from '@tpluscode/rdf-ns-builders'
import { ViewerMatcher } from '../index.js'

export const LiteralViewer: ViewerMatcher = {
  viewer: dash.LiteralViewer,
  match({ resource }) {
    return resource.term.termType === 'Literal' ? 1 : 0
  },
}
