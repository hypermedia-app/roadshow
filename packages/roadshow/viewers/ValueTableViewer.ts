import { dash } from '@tpluscode/rdf-ns-builders'
import { ViewerMatcher } from '../index'

export const ValueTableViewer: ViewerMatcher = {
  viewer: dash.ValueTableViewer,
  match() {
    return null
  },
}
