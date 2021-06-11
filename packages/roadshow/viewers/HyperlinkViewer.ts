import { dash, xsd } from '@tpluscode/rdf-ns-builders'
import { ViewerMatchInit } from '../index'

export const HyperlinkViewer: ViewerMatchInit = {
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
