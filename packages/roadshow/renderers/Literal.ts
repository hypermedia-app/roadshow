import { dash } from '@tpluscode/rdf-ns-builders'
import { Renderer } from '../index'

export const Literal: Renderer = {
  viewer: dash.LiteralViewer,
  render(resource) {
    return resource.value
  },
}
