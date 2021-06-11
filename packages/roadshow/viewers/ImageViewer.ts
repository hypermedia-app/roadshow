import { dash } from '@tpluscode/rdf-ns-builders'
import { ViewerMatchInit } from '../index'

interface ImageViewerMatchInit extends ViewerMatchInit {
  extensions: string[]
}

export const ImageViewer: ImageViewerMatchInit = {
  viewer: dash.ImageViewer,
  match({ resource }) {
    if (resource.term.termType === 'NamedNode' || resource.term.termType === 'Literal') {
      if (new RegExp(`\\.${this.extensions.join('|')}$`, 'i').test(resource.value)) {
        return 50
      }
    }

    return 0
  },
  extensions: [
    'bmp',
    'gif',
    'jpeg',
    'jpg',
    'png',
    'svg',
  ],
}
