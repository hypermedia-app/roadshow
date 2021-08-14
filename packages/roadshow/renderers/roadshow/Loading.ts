import { roadshow } from '@hydrofoil/vocabularies/builders'
import { Renderer } from '../../index'

export const Loading: Renderer = {
  viewer: roadshow.LoadingViewer,
  render() {
    return 'Loading...'
  },
}
