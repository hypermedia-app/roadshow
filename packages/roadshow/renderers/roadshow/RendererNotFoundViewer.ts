import { roadshow } from '@hydrofoil/vocabularies/builders'
import { Renderer } from '../../index'

export const RendererNotFoundViewer: Renderer = {
  viewer: roadshow.RendererNotFoundViewer,
  render() {
    return `Renderer not found for viewer ${this.state.viewer.value}`
  },
}
