import { dash } from '@tpluscode/rdf-ns-builders'
import { ViewerMatchInit } from '../index'

export const ValueTableViewer: ViewerMatchInit = {
  viewer: dash.ValueTableViewer,
  match() {
    return null
  },
}
