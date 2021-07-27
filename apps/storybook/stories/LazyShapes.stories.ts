import { html } from 'lit'
import { Renderer, ViewerMatchInit } from '@hydrofoil/roadshow'
import { findNodes } from 'clownface-shacl-path'
import { hydra, sh, rdf, dash } from '@tpluscode/rdf-ns-builders'
import { ShapesLoader } from '@hydrofoil/roadshow/ShapesController'
import TermSet from '@rdf-esm/term-set'
import { namedNode } from '@rdf-esm/data-model'
import type { GraphPointer } from 'clownface'
import { ResourceLoader } from '@hydrofoil/roadshow/ResourcesController'
import clownface from 'clownface'
import { RoadshowController } from '@hydrofoil/roadshow/RoadshowController'
import type { NodeShape } from '@rdfine/shacl'
import { ResourceViewState } from '@hydrofoil/roadshow/lib/state'
import { template } from '../lib/template'
import hydraCollectionShape from '../shapes/hydra-collection.ttl'
import wikibusBrochure from '../shapes/wikibus-Brochure.ttl'
import { runFactory } from '../resources/runFactory'
import brochures from '../resources/wikibus-brochures.trig'

const collectionViewer: ViewerMatchInit = {
  viewer: dash.HydraCollectionViewer,
  match({ resource }) {
    return resource.has(rdf.type, hydra.Collection).terms.length ? 50 : 0
  },
}

declare module '@hydrofoil/roadshow' {
  interface LocalState {
    memberShape?: NodeShape
    applicableMemberShapes?: NodeShape[]
  }
}

const tableView: Renderer<ResourceViewState> = {
  viewer: dash.HydraCollectionViewer,
  render(collection) {
    const { memberShape } = this.state.locals
    if (!memberShape) {
      const memberTypes = collection
        .out(hydra.manages)
        .has(hydra.property, rdf.type)
        .out(hydra.object);

      (async () => {
        this.state.locals.applicableMemberShapes = await this.shapes.findApplicableShape({ class: memberTypes });
        [this.state.locals.memberShape] = this.state.locals.applicableMemberShapes
        this.requestUpdate()
      })()

      return RoadshowController.renderLoadingSlot()
    }

    return html`<table>
      <thead>
        <tr>
          ${memberShape.property.map(prop => html`<td>${prop.name}</td>`)}
        </tr>
      </thead>
      <tbody>
        ${collection.out(hydra.member).map(member => html`<tr>
          ${memberShape.property.filter(({ hidden }) => !hidden).map(property => html`
          <td>
            ${findNodes(member, property.pointer.out(sh.path).toArray()[0]).map(resource => html`${this.show({ resource, property })}`)}
          </td>`)}
        </tr>`)}
      </tbody>
    </table>`
  },
}

export default {
  title: 'Loading shapes on demand',
}

interface ViewStoryParams {
  resource: GraphPointer
  viewers: ViewerMatchInit[]
  renderers: Renderer[]
}

const load: ShapesLoader = async (applicableTo) => {
  await new Promise((resolve) => {
    setTimeout(resolve, Math.random() * 100 + 1000)
  })

  if ('resource' in applicableTo) {
    const { resource } = applicableTo

    if (resource.has(rdf.type, hydra.Collection).terms.length) {
      return [runFactory(hydraCollectionShape)]
    }
  } else if ('_context' in applicableTo.class) {
    if (new TermSet(applicableTo.class.terms).has(namedNode('https://wikibus.org/ontology#Brochure'))) {
      return [runFactory(wikibusBrochure)]
    }
  }

  return []
}

const { dataset } = runFactory(brochures)
const loadResource: ResourceLoader = async (id) => {
  await new Promise((resolve) => {
    setTimeout(resolve, Math.random() * 100 + 1000)
  })

  return clownface({ dataset, graph: id }).namedNode(id)
}

const Template = template<ViewStoryParams>(({ resource, viewers, renderers }) => html`
  <roadshow-view .resource="${resource}"
                 .viewers="${viewers}"
                 .shapesLoader="${load}"
                 .resourceLoader="${loadResource}"
                 .renderers="${renderers}"
  ></roadshow-view>
`)

export const AddressBookTable = Template.bind({})
AddressBookTable.args = {
  resource: runFactory(brochures).namedNode('https://sources.wikibus.org/brochures'),
  viewers: [collectionViewer],
  renderers: [tableView],
}
