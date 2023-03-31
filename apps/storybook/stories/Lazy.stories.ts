import { html } from 'lit'
import { MultiRenderer, Renderer, ViewerMatcher } from '@hydrofoil/roadshow'
import { hydra, rdf } from '@tpluscode/rdf-ns-builders'
import $rdf from '@rdfjs/data-model'
import { ResourceLoader } from '@hydrofoil/roadshow/ResourcesController'
import clownface, { MultiPointer } from 'clownface'
import { runFactory } from '@roadshow/build-helpers/runFactory'
import { template } from '../lib/template'
import hydraCollectionShape from '../shapes/hydra-collection.ttl'
import wikibusBrochure from '../shapes/wikibus-Brochure.ttl'
import brochures from '../resources/wikibus-brochures.trig'
import { wbo } from '../lib/ns'
import { tableView } from '../viewers/hydra-MembersViewer/table'
import { localizedLabel } from '../viewers/ex-LocalLabelViewer'
import * as pagerViewer from '../viewers/hydra-PartialCollectionViewer'

export default {
  title: 'Lazy loading resources',
}

interface ViewStoryParams {
  resource: string
  viewers: ViewerMatcher[]
  renderers: Array<Renderer<any> | MultiRenderer>
}

const { dataset } = runFactory(brochures)

const load: ResourceLoader = async (id) => {
  await new Promise((resolve) => {
    setTimeout(resolve, Math.random() * 100 + 1000)
  })

  return clownface({ dataset, graph: id }).namedNode(id)
}

async function selectShape(arg: MultiPointer) {
  if (arg.has(rdf.type, hydra.Collection).terms.length) {
    return [runFactory(hydraCollectionShape)]
  }
  if (arg.has(rdf.type, wbo.Brochure).terms.length) {
    return [runFactory(wikibusBrochure)]
  }

  return []
}

const Template = template<ViewStoryParams>(({ resource, viewers = [], renderers }) => html`
    <roadshow-view .resourceId="${$rdf.namedNode(resource)}"
                   .shapesLoader="${selectShape}"
                   .viewers="${viewers}"
                   .resourceLoader="${load}"
                   .renderers="${renderers}"
    ></roadshow-view>
    `)

export const AddressBookTable = Template.bind({})
AddressBookTable.args = {
  resource: 'https://sources.wikibus.org/brochures',
  renderers: [tableView, localizedLabel, pagerViewer.renderer],
  viewers: [pagerViewer.matcher],
}
