import { dash } from '@tpluscode/rdf-ns-builders'
import { Renderer } from '../index.js'

export const Literal: Renderer = {
  viewer: dash.LiteralViewer,
  render(resource) {
    return resource.values[0]
  },
}
