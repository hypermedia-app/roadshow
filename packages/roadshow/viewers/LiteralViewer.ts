import { dash } from '@tpluscode/rdf-ns-builders'
import { ViewerMatchInit } from '../index'

export const LiteralViewer: ViewerMatchInit = {
  viewer: dash.LiteralViewer,
  match({ resource }) {
    return resource.term.termType === 'Literal' ? 1 : 0
  },
}
