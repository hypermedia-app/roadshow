import { dash, rdf } from '@tpluscode/rdf-ns-builders'
import { ViewerMatchInit } from '../index'

export const HTMLViewer: ViewerMatchInit = {
  viewer: dash.HTMLViewer,
  match({ resource }) {
    return resource.term.termType === 'Literal' && resource.term.datatype.equals(rdf.HTML) ? 50 : 0
  },
}
