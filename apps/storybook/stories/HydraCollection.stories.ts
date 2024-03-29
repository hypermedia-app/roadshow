import { html } from 'lit'
import { MultiRenderer, Renderer, ViewerMatcher, Decorator } from '@hydrofoil/roadshow'
import '@hydrofoil/roadshow/roadshow-view'
import { hydra, rdf, schema } from '@tpluscode/rdf-ns-builders'
import type { MultiPointer } from 'clownface'
import { runFactory } from '@roadshow/build-helpers/runFactory'
import { template } from '../lib/template'
import addressBook, { QuadArrayFactory } from '../resources/hydra-collection.ttl'
import hydraCollectionShape from '../shapes/hydra-collection.ttl'
import hydraPartialCollectionViewShape from '../shapes/hydra-PartialCollectionView.ttl'
import schemaPerson from '../shapes/schema-person.ttl'
import { tableView } from '../viewers/hydra-MembersViewer/table'
import { galleryView } from '../viewers/hydra-MembersViewer/gallery'
import { localizedLabel } from '../viewers/ex-LocalLabelViewer'
import * as pagerViewer from '../viewers/hydra-PartialCollectionViewer'
import * as imageViewer from '../viewers/schema-ImageViewer'
import { rendererSwitcher } from '../decorators/rendererSwitcher'

export default {
  title: 'Hydra Collection',
}

interface ViewStoryParams {
  resource: QuadArrayFactory
  viewers: ViewerMatcher[]
  renderers: Array<Renderer<any> | MultiRenderer>
  decorators?: Decorator[]
}

async function selectShape(arg: MultiPointer) {
  if (arg.has(rdf.type, hydra.Collection).terms.length) {
    return [runFactory(hydraCollectionShape)]
  }
  if (arg.has(rdf.type, schema.Person).terms.length) {
    return [runFactory(schemaPerson)]
  }
  if (arg.has(rdf.type, hydra.PartialCollectionView).terms.length) {
    return [runFactory(hydraPartialCollectionViewShape)]
  }

  return []
}

const Template = template<ViewStoryParams>(({ resource, viewers, renderers, decorators }) => html`
    <roadshow-view .resource="${runFactory(resource)}"
                   .shapesLoader="${selectShape}"
                   .viewers="${viewers}"
                   .renderers="${renderers}"
                   .decorators="${decorators}"
    ></roadshow-view>
    `)

export const AddressBookTable = Template.bind({})
AddressBookTable.args = {
  resource: addressBook,
  viewers: [pagerViewer.matcher],
  renderers: [tableView, pagerViewer.renderer, localizedLabel],
}

export const ProfileGallery = Template.bind({})
ProfileGallery.args = {
  resource: addressBook,
  viewers: [imageViewer.matcher, pagerViewer.matcher],
  renderers: [galleryView, imageViewer.renderer, pagerViewer.renderer, localizedLabel],
}

export const DecoratedViewerSwitcher = Template.bind({})
DecoratedViewerSwitcher.args = {
  resource: addressBook,
  viewers: [imageViewer.matcher, pagerViewer.matcher],
  renderers: [tableView, galleryView, imageViewer.renderer, pagerViewer.renderer, localizedLabel],
  decorators: [rendererSwitcher],
}
