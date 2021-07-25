import { html } from 'lit'
import { MultiRenderer, Renderer, ViewerMatchInit } from '@hydrofoil/roadshow'
import '@hydrofoil/roadshow/roadshow-view'
import { findNodes } from 'clownface-shacl-path'
import { hydra, sh, rdf, schema, dash, rdfs } from '@tpluscode/rdf-ns-builders'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { NamedNode } from 'rdf-js'
import type { MultiPointer } from 'clownface'
import type { Literal } from '@rdfjs/types'
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

const pagerViewer: ViewerMatchInit = {
  viewer: dash.HydraPartialCollectionViewViewer,
  match({ resource }) {
    return resource.has(rdf.type, hydra.PartialCollectionView).terms.length ? 50 : 0
  },
}

const localizedLabelViewer: ViewerMatchInit = {
  viewer: dash.LocalLabelViewer,
  matchMulti({ state }) {
    return state.path?.equals(rdfs.label) ? 1 : 0
  },
}

const localizedLabel: MultiRenderer<any> = {
  viewer: dash.LocalLabelViewer,
  render(resources: MultiPointer<Literal>) {
    const arr = resources.toArray()
    const label = arr.find(r => r.term.language === this.params.language) || arr.find(r => r.term.language === 'en')

    return label ? html`${this.show({ property: rdfs.label, resource: label, viewer: dash.LiteralViewer })}` : ''
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
    const viewPropertyShape = shape?.property.find(({ pointer }) => hydra.view.equals(pointer.out(sh.path).term))

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
    </table>

    ${collection.out(hydra.view).map(view => this.show({
    resource: view,
    property: viewPropertyShape || hydra.view,
  }))}`
  },
}

const pagerView: Renderer = {
  viewer: dash.HydraPartialCollectionViewViewer,
  render(resource) {
    const link = (property: NamedNode) => {
      const page = resource.out(property).toArray()[0]
      return !page
        ? ''
        : this.show({
          resource: page,
          property,
          viewer: dash.URIViewer,
        })
    }

    return html`<div>
      <span>${link(hydra.first)}</span>
      <span>${link(hydra.previous)}</span>
      <span>${link(hydra.next)}</span>
      <span>${link(hydra.last)}</span>
    </div>`
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
  renderers: Array<Renderer | MultiRenderer>
  language?: string
}

const Template = template<ViewStoryParams>(({ resource, viewers, renderers, language }) => {
  const shapes = [
    hydraCollectionShape,
    schemaPerson,
  ].map(runFactory).map(p => fromPointer(p))

  return html`
    <roadshow-view .resource="${runFactory(resource)}"
                   .shapes="${shapes}"
                   .viewers="${viewers}"
                   .renderers="${renderers}"
                   .params="${{ language }}"
    ></roadshow-view>
    `
})

export const AddressBookTable = Template.bind({})
AddressBookTable.args = {
  resource: addressBook,
  viewers: [collectionViewer, pagerViewer, localizedLabelViewer],
  renderers: [tableView, tableRowView, pagerView, localizedLabel],
  language: '',
}

export const ProfileGallery = Template.bind({})
ProfileGallery.args = {
  resource: addressBook,
  viewers: [collectionViewer, imageViewer],
  renderers: [galleryView, galleryMemberView, imageView],
}
