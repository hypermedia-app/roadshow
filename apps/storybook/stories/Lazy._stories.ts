/* import { html } from 'lit'
import { Renderer, ViewerMatcher } from '@hydrofoil/roadshow'
import { findNodes } from 'clownface-shacl-path'
import { hydra, sh, rdf, dash } from '@tpluscode/rdf-ns-builders'
import { namedNode } from '@rdf-esm/data-model'
import { ResourceLoader } from '@hydrofoil/roadshow/ResourcesController'
import clownface from 'clownface'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { template } from '../lib/template'
import hydraCollectionShape from '../shapes/hydra-collection.ttl'
import wikibusBrochure from '../shapes/wikibus-Brochure.ttl'
import { runFactory } from '../resources/runFactory'
import brochures from '../resources/wikibus-brochures.trig'

const collectionViewer: ViewerMatcher = {
  viewer: dash.HydraCollectionViewer,
  match({ resource }) {
    return resource.has(rdf.type, hydra.Collection).terms.length ? 50 : 0
  },
}

const tableView: Renderer = {
  viewer: dash.HydraCollectionViewer,
  render(collection) {
    const memberTypes = collection
      .out(hydra.manages)
      .has(hydra.property, rdf.type)
      .out(hydra.object)

    const memberShape = this.shapes.shapes
      .find(shape => shape.pointer.has(sh.targetClass, memberTypes).terms.length)

    return html`<table>
      <thead>
        <tr>
          ${memberShape?.property.map(prop => html`<td>${prop.name}</td>`)}
        </tr>
      </thead>
      <tbody>
        ${collection.out(hydra.member).map(member => html`<tr>
          ${memberShape?.property.filter(({ hidden }) => !hidden).map(property => html`
          <td>
            ${findNodes(member, property.pointer.out(sh.path).toArray()[0]).map(resource => html`${this.show({ resource, property })}`)}
          </td>`)}
        </tr>`)}
      </tbody>
    </table>`
  },
}

export default {
  title: 'Lazy loading',
}

interface ViewStoryParams {
  resource: string
  viewers: ViewerMatchInit[]
  renderers: Renderer[]
}

const { dataset } = runFactory(brochures)

const load: ResourceLoader = async (id) => {
  await new Promise((resolve) => {
    setTimeout(resolve, Math.random() * 100 + 1000)
  })

  return clownface({ dataset, graph: id }).namedNode(id)
}

const Template = template<ViewStoryParams>(({ resource, viewers, renderers }) => {
  const shapes = [
    hydraCollectionShape,
    wikibusBrochure,
  ].map(runFactory).map(p => fromPointer(p))

  return html`
    <roadshow-view .resourceId="${namedNode(resource)}"
                   .shapes="${shapes}"
                   .viewers="${viewers}"
                   .resourceLoader="${load}"
                   .renderers="${renderers}"
    ></roadshow-view>
    `
})

export const AddressBookTable = Template.bind({})
AddressBookTable.args = {
  resource: 'https://sources.wikibus.org/brochures',
  viewers: [collectionViewer],
  renderers: [tableView],
}
*/
