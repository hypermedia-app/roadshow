import { dash } from '@tpluscode/rdf-ns-builders'
import { ViewerMatchInit } from '../index'

export const DetailsViewer: ViewerMatchInit = {
  viewer: dash.DetailsViewer,
  match({ resource }) {
    return resource.term.termType === 'BlankNode' || resource.term.termType === 'NamedNode' ? null : 0
  },
}
