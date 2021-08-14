import { roadshow } from '@hydrofoil/vocabularies/builders'
import { Renderer } from '../../index'

export const LoadingFailed: Renderer = {
  viewer: roadshow.LoadingFailedViewer,
  render() {
    return 'Loading failed!'
  },
}
