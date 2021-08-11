import { html } from 'lit'
import { MultiRenderer, Renderer, ViewerMatcher } from '@hydrofoil/roadshow'
import { hydra, sh, rdf } from '@tpluscode/rdf-ns-builders/strict'
import { namedNode } from '@rdf-esm/data-model'
import { ResourceLoader } from '@hydrofoil/roadshow/ResourcesController'
import clownface, { MultiPointer } from 'clownface'
import { PropertyState } from '@hydrofoil/roadshow/lib/state'
import { template } from '../lib/template'
import hydraCollectionShape from '../shapes/hydra-collection.ttl'
import wikibusBrochure from '../shapes/wikibus-Brochure.ttl'
import { runFactory } from '../resources/runFactory'
import brochures from '../resources/wikibus-brochures.trig'
import { hex, wbo } from '../lib/ns'

const tableView: MultiRenderer = {
  viewer: hex.MembersViewer,
  render(members) {
    const propertyShapes = this.state.shape?.property
      .filter(p => !p.hidden) || []

    const memberRows = members.map(member => this.object(member, {
      resource() {
        const rowData = propertyShapes
          .reduce((previous, shape) => {
            const found = this.state.properties.find(property => property.path.term.equals(shape.pointer.out(sh.path).term))
            if (found) {
              return [...previous, found]
            }
            return previous
          }, [] as PropertyState[])
          .map(property => html`<td>${this.show({ property })}</td>`)

        return html`<tr>${rowData}</tr>`
      },
    }))

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
    <roadshow-view .resourceId="${namedNode(resource)}"
                   .shapesLoader="${selectShape}"
                   .viewers="${viewers}"
                   .resourceLoader="${load}"
                   .renderers="${renderers}"
    ></roadshow-view>
    `)

export const AddressBookTable = Template.bind({})
AddressBookTable.args = {
  resource: 'https://sources.wikibus.org/brochures',
  renderers: [tableView],
}
