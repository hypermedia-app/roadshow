import { roadshow } from '@hydrofoil/vocabularies/builders'
import { Renderer } from '../../index.js'

export const LoadingFailed: Renderer = {
  viewer: roadshow.LoadingFailedViewer,
  render() {
    return 'Loading failed!'
  },
}
