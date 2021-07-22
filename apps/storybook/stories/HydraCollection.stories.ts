import { html } from 'lit'
import { Renderer, ViewerMatchInit } from '@hydrofoil/roadshow'
import '@hydrofoil/roadshow/roadshow-view'
import { findNodes } from 'clownface-shacl-path'
import { hydra, sh, rdf, schema, dash } from '@tpluscode/rdf-ns-builders'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { template } from '../lib/template'
import addressBook, { QuadArrayFactory } from '../resources/hydra-collection.ttl'
import hydraCollectionShape from '../shapes/hydra-collection.ttl'
import schemaPerson from '../shapes/schema-person.ttl'
import { runFactory } from '../resources/runFactory'

const collectionViewer: ViewerMatchInit = {
  viewer: dash.HydraCollectionViewer,
  match({ resource }) {
    return resource.has(rdf.type, hydra.Collection).terms.length ? 50 : 0
  },
}

const tableView: Renderer = {
  viewer: dash.HydraCollectionViewer,
  render(collection, shape) {
    const memberTypes = collection
      .out(hydra.manages)
      .has(hydra.property, rdf.type)
      .out(hydra.object)

    const memberShape = this.shapes.shapes
      .find(shape => shape.pointer.has(sh.targetClass, memberTypes).terms.length)
    const memberPropertyShape = shape?.property.find(({ pointer }) => hydra.member.equals(pointer.out(sh.path).term))

    return html`<table>
      <thead>
        <tr>
          ${memberShape?.property.filter(p => !p.hidden).map(prop => html`<td>${prop.name}</td>`)}
        </tr>
      </thead>
      <tbody>
        ${collection.out(hydra.member).map(resource => html`<tr>${this.show({
    resource,
    shape: memberShape,
    property: memberPropertyShape || hydra.member,
  })}</tr>`)}
      </tbody>
    </table>`
  },
}

const tableRowView: Renderer = {
  viewer: dash.HydraMemberViewer,
  render(member, memberShape) {
    return html`
      ${memberShape?.property.filter(({ hidden }) => !hidden).map(property => html`<td>
        ${findNodes(member, property.pointer.out(sh.path)).map(resource => html`
          ${this.show({ resource, shape: memberShape, property })}
        `)}
      </td>`)}
    `
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

    return html`<div>
      ${collection.out(hydra.member).map(resource => this.show({
    resource,
    shape: memberShape,
    property: hydra.member,
    viewer: dash.HydraMemberViewer,
  }))}
    </div>`
  },
}

const galleryMemberView: Renderer = {
  viewer: dash.HydraMemberViewer,
  render(member) {
    const images = member.out(schema.image).toArray()

    return html`${images.map(image => html`<div>
      ${this.show({ resource: image, property: schema.image })}
    </div>`)}`
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
  ].map(runFactory).map(p => fromPointer(p))

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
  renderers: [tableView, tableRowView],
}

export const ProfileGallery = Template.bind({})
ProfileGallery.args = {
  resource: addressBook,
  viewers: [collectionViewer, imageViewer],
  renderers: [galleryView, galleryMemberView, imageView],
}
