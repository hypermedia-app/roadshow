import { html } from 'lit'
import roadshow, { Viewer } from '@hydrofoil/roadshow'
import { findNodes } from 'clownface-shacl-path'
import { hydra, sh, rdf } from '@tpluscode/rdf-ns-builders'
import type { GraphPointer } from 'clownface'
import { namedNode } from '@rdf-esm/data-model'
import { NamedNode } from 'rdf-js'
import { template } from '../lib/template'
import hydraCollectionShape from '../shapes/hydra-collection'
import wikibusBrochure from '../shapes/wikibus-Brochure'
import { runFactory } from '../resources/runFactory'
import brochures from '../resources/wikibus-brochures.trig'

const tableViewer: Viewer = {
  match({ shape }) {
    return shape?.targetClass.some(tc => tc.equals(hydra.Collection)) ? 50 : 0
  },
  render(roadshow, collection) {
    const memberTypes = collection
      .out(hydra.manages)
      .has(hydra.property, rdf.type)
      .out(hydra.object)

    const memberShape = roadshow.shapes
      .find(shape => shape.pointer.has(sh.targetClass, memberTypes).terms.length)

    return html`<table>
      <thead>
        <tr>
          ${memberShape?.property.map(prop => html`<td>${prop.name}</td>`)}
        </tr>
      </thead>
      <tbody>
        ${collection.out(hydra.member).map(member => html`<tr>
          ${memberShape?.property.filter(({ hidden }) => !hidden).map(prop => html`
          <td>
            ${findNodes(member, prop.pointer.out(sh.path).toArray()[0]).map(resource => html`${roadshow.show({ resource })}`)}
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
  viewers: Viewer[]
}

const dataset = runFactory(brochures)

async function load(id: NamedNode): Promise<GraphPointer<NamedNode>> {
  await new Promise((resolve) => {
    setTimeout(resolve, Math.random() * 100 + 1000)
  })

  return dataset.namedNode(id)
}

const Template = template<ViewStoryParams>(({ resource, viewers }) => {
  const { show } = roadshow({
    shapes: [
      hydraCollectionShape.pointer,
      wikibusBrochure.pointer,
    ],
    viewers,
    load,
  })

  return html`
    ${show({ resource: load(namedNode(resource)) })}
    `
})

export const AddressBookTable = Template.bind({})
AddressBookTable.args = {
  resource: 'https://sources.wikibus.org/brochures',
  viewers: [tableViewer],
}
