import { html } from 'lit'
import { MultiRenderer, Renderer, ViewerMatcher } from '@hydrofoil/roadshow'
import { hydra, rdf } from '@tpluscode/rdf-ns-builders'
import { ShapesLoader } from '@hydrofoil/roadshow/ShapesController'
import type { GraphPointer } from 'clownface'
import { ResourceLoader } from '@hydrofoil/roadshow/ResourcesController'
import TermMap from '@rdf-esm/term-map'
import type { Term } from '@rdfjs/types'
import { template } from '../lib/template'
import hydraCollectionShape from '../shapes/hydra-collection.ttl'
import wikibusBrochure from '../shapes/wikibus-Brochure.ttl'
import { runFactory } from '../resources/runFactory'
import brochures from '../resources/wikibus-brochures.trig'
import { ex, hex, wbo } from '../lib/ns'

const tableView: MultiRenderer = {
  viewer: hex.MembersViewer,
  render(members) {
    const propertyShapes = this.state.shape?.property
      .filter(p => !p.hidden) || []

    const memberRows = members.map(member => html`<tr>${this.object(member, {
      resource() {
        return html`${propertyShapes.map(property => html`<td>${this.show({ property })}</td>`)}`
      },
    })}</tr>`)

    return html`<table>
      <thead>
      <tr>
        ${propertyShapes.map(prop => html`<td>${prop.name}</td>`)}
      </tr>
      </thead>
      <tbody>
        ${memberRows}
      </tbody>
    </table>`
  },
}

export default {
  title: 'Lazy loading shapes',
}

interface ViewStoryParams {
  resource: GraphPointer
  viewers: ViewerMatcher[]
  renderers: Array<Renderer<any> | MultiRenderer>
}

const resourceCache = new TermMap()

async function fakeCachedRequest<T>(id: Term, representation: T) {
  if (!resourceCache.has(id)) {
    await new Promise((resolve) => {
      setTimeout(resolve, Math.random() * 100 + 1000)
    })
  }

  resourceCache.set(id, representation)

  return representation
}

const load: ShapesLoader = async (resource) => {
  if (resource.has(rdf.type, hydra.Collection).terms.length) {
    return [await fakeCachedRequest(ex.CollectionShape, runFactory(hydraCollectionShape))]
  } if (resource.has(rdf.type, wbo.Brochure).terms.length) {
    return [await fakeCachedRequest(ex.BrochureShape, runFactory(wikibusBrochure))]
  }

  return []
}

const loadResource: ResourceLoader = async (id) => {
  const graph = await fakeCachedRequest(id, runFactory(brochures))

  return graph.namedNode(id)
}

const Template = template<ViewStoryParams>(({ resource, viewers = [], renderers }) => {
  resourceCache.clear()
  return html`
    <roadshow-view .resource="${resource}"
                   .viewers="${viewers}"
                   .shapesLoader="${load}"
                   .resourceLoader="${loadResource}"
                   .renderers="${renderers}"
    ></roadshow-view>
  `
})

export const AddressBookTable = Template.bind({})
AddressBookTable.args = {
  resource: runFactory(brochures).namedNode('https://sources.wikibus.org/brochures'),
  renderers: [tableView],
}
