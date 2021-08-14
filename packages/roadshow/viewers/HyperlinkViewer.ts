import { dash, xsd } from '@tpluscode/rdf-ns-builders'
import { ViewerMatcher } from '../index'

export const HyperlinkViewer: ViewerMatcher = {
  viewer: dash.HyperlinkViewer,
  match({ resource }) {
    if (resource.term.termType === 'Literal') {
      if (resource.term.datatype.equals(xsd.anyURI)) {
        return 50
      }

      if (resource.term.datatype.equals(xsd.string)) {
        return null
      }
    }

    return 0
  },
}
