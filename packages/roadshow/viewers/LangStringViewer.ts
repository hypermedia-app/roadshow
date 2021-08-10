import { dash } from '@tpluscode/rdf-ns-builders'
import { ViewerMatcher } from '../index'

export const LangStringViewer: ViewerMatcher = {
  viewer: dash.LangStringViewer,
  match({ resource }) {
    return resource.term.termType === 'Literal' && resource.term.language ? 10 : 0
  },
}
