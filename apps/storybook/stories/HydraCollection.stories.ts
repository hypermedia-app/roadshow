import { html } from 'lit'
import roadshow, { Viewer } from '@hydrofoil/roadshow'
import { findNodes } from 'clownface-shacl-path'
import { hydra, sh, rdf, schema } from '@tpluscode/rdf-ns-builders'
import { template } from '../lib/template'
import addressBook, { QuadArrayFactory } from '../resources/hydra-collection.ttl'
import hydraCollectionShape from '../shapes/hydra-collection'
import schemaPerson from '../shapes/schema-person'
import { runFactory } from '../resources/runFactory'

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
          ${memberShape?.property.filter(({ hidden }) => !hidden).map(prop => html`<td>
            ${findNodes(member, prop.pointer.out(sh.path).toArray()[0]).map(resource => html`${roadshow.show({ resource })}`)}
          </td>`)}
        </tr>`)}
      </tbody>
    </table>`
  },
}

const galleryViewer: Viewer = {
  match({ shape }) {
    return shape?.targetClass.some(tc => tc.equals(hydra.Collection)) ? 60 : 0
  },
  render(roadshow, collection) {
    const memberTypes = collection
      .out(hydra.manages)
      .has(hydra.property, rdf.type)
      .out(hydra.object)

    const memberShape = roadshow.shapes
      .find(shape => shape.pointer.has(sh.targetClass, memberTypes).terms.length)
    const imageShape = memberShape?.property.find(s => s.pointer.has(sh.path, schema.image).term)?.node

    return html`<div>
        ${collection.out(hydra.member).map((member) => {
    const resource = member.out(schema.image).toArray()[0]
    return html`<div>${roadshow.show({ resource, shape: imageShape })}</div>`
  })}
    </div>`
  },
}

const imageViewer: Viewer = {
  match({ shape }) {
    return shape?.targetClass.some(tc => tc.equals(schema.ImageObject)) ? 50 : 0
  },
  render(roadshow, image) {
    return html`<div>
        <img src="${image.out(schema.contentUrl).value || ''}" alt="${image.out(schema.caption).value || ''}">
    </div>`
  },
}

export default {
  title: 'Hydra Collection',
}

interface ViewStoryParams {
  resource: QuadArrayFactory
  viewers: Viewer[]
}

const Template = template<ViewStoryParams>(({ resource, viewers }) => {
  const { show } = roadshow({
    shapes: [
      hydraCollectionShape.pointer,
      schemaPerson.pointer,
    ],
    viewers,
  })

  return html`
    ${show({ resource: runFactory(resource) })}
    `
})

export const AddressBookTable = Template.bind({})
AddressBookTable.args = {
  resource: addressBook,
  viewers: [tableViewer],
}

export const ProfileGallery = Template.bind({})
ProfileGallery.args = {
  resource: addressBook,
  viewers: [galleryViewer, imageViewer],
}
