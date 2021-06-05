import { dash } from '@tpluscode/rdf-ns-builders'
import { ViewerMatchInit } from '../index'

export const LabelViewer: ViewerMatchInit = {
  viewer: dash.LabelViewer,
  match({ resource }) {
    return resource.term.termType === 'NamedNode' ? 5 : 0
  },
}
