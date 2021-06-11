import { html } from 'lit'
import { Renderer, ViewerMatchInit } from '@hydrofoil/roadshow'
import '@hydrofoil/roadshow/roadshow-view'
import { findNodes } from 'clownface-shacl-path'
import { hydra, sh, rdf, schema, dash } from '@tpluscode/rdf-ns-builders'
import { template } from '../lib/template'
import addressBook, { QuadArrayFactory } from '../resources/hydra-collection.ttl'
import hydraCollectionShape from '../shapes/hydra-collection'
import schemaPerson from '../shapes/schema-person'
import { runFactory } from '../resources/runFactory'

const collectionViewer: ViewerMatchInit = {
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
          ${memberShape?.property.filter(({ hidden }) => !hidden).map(prop => html`<td>
            ${findNodes(member, prop.pointer.out(sh.path).toArray()[0]).map(resource => html`${this.show({ resource, shape: memberShape })}`)}
          </td>`)}
        </tr>`)}
      </tbody>
    </table>`
  },
}

const galleryView: Renderer = {
  viewer: dash.HydraCollectionViewer,
  render(collection) {
    const memberTypes = collection
      .out(hydra.manages)
      .has(hydra.property, rdf.type)
      .out(hydra.object)

    const memberShape = this.shapes.shapes
      .find(shape => shape.pointer.has(sh.targetClass, memberTypes).terms.length)
    const imageShape = memberShape?.property.find(s => s.pointer.has(sh.path, schema.image).term)?.node

    return html`<div>
        ${collection.out(hydra.member).map((member) => {
    const resource = member.out(schema.image).toArray()[0]
    return html`<div>${this.show({ resource, shape: imageShape })}</div>`
  })}
    </div>`
  },
}

const imageViewer: ViewerMatchInit = {
  viewer: dash.SchemaImageViewer,
  match({ resource }) {
    return resource.has(rdf.type, schema.ImageObject).terms.length ? 50 : 0
  },
}

const imageView: Renderer = {
  viewer: dash.SchemaImageViewer,
  render(image) {
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
  viewers: ViewerMatchInit[]
  renderers: Renderer[]
}

const Template = template<ViewStoryParams>(({ resource, viewers, renderers }) => {
  const shapes = [
    hydraCollectionShape,
    schemaPerson,
  ]

  return html`
    <roadshow-view .resource="${runFactory(resource)}"
                   .shapes="${shapes}"
                   .viewers="${viewers}"
                   .renderers="${renderers}"
    ></roadshow-view>
    `
})

export const AddressBookTable = Template.bind({})
AddressBookTable.args = {
  resource: addressBook,
  viewers: [collectionViewer],
  renderers: [tableView],
}

export const ProfileGallery = Template.bind({})
ProfileGallery.args = {
  resource: addressBook,
  viewers: [collectionViewer, imageViewer],
  renderers: [galleryView, imageView],
}
