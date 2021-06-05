import { dash } from '@tpluscode/rdf-ns-builders'
import { ViewerMatchInit } from '../index'

export const URIViewer: ViewerMatchInit = {
  viewer: dash.URIViewer,
  match({ resource }) {
    return resource.term.termType === 'NamedNode' ? 1 : 0
  },
}
