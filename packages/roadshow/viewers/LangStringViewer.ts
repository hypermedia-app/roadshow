import { dash } from '@tpluscode/rdf-ns-builders'
import { ViewerMatchInit } from '../index'

export const LangStringViewer: ViewerMatchInit = {
  viewer: dash.LangStringViewer,
  match({ resource }) {
    return resource.term.termType === 'Literal' && resource.term.language ? 10 : 0
  },
}
