import { html } from 'lit'
import { MultiRenderer, Renderer, ViewerMatcher } from '@hydrofoil/roadshow'
import '@hydrofoil/roadshow/roadshow-view'
import { hydra, sh, rdf, schema, dash } from '@tpluscode/rdf-ns-builders/strict'
import { NamedNode } from 'rdf-js'
import type { MultiPointer } from 'clownface'
import { ViewersController } from '@hydrofoil/roadshow/ViewersController'
import { PropertyState } from '@hydrofoil/roadshow/lib/state'
import { isLiteral } from '@hydrofoil/roadshow/lib/clownface'
import { template } from '../lib/template'
import addressBook, { QuadArrayFactory } from '../resources/hydra-collection.ttl'
import hydraCollectionShape from '../shapes/hydra-collection.ttl'
import hydraPartialCollectionViewShape from '../shapes/hydra-PartialCollectionView.ttl'
import schemaPerson from '../shapes/schema-person.ttl'
import { runFactory } from '../resources/runFactory'
import { ex, hex } from '../lib/ns'
import { FocusNodeViewContext } from '../../../packages/roadshow/lib/ViewContext/index'

const pagerViewer: ViewerMatcher = {
  viewer: hex.PartialCollectionViewViewer,
  match({ resource }) {
    return resource.has(rdf.type, hydra.PartialCollectionView).terms.length ? 50 : 0
  },
}

const localizedLabel: MultiRenderer = {
  viewer: ex.LocalLabelViewer,
  render(resources: MultiPointer) {
    const arr = resources.toArray().filter(isLiteral)
    const label = arr.find(r => r.term.language === this.params.language) || arr.find(r => r.term.language === 'en')

    if (!label) {
      return ''
    }

    return this.object(label, { })
  },
}

const tableView: MultiRenderer = {
  viewer: hex.MembersViewer,
  render(members) {
    this.controller.shapes.loadShapes(this.state, members)

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

const pagerView: Renderer<FocusNodeViewContext> = {
  viewer: hex.PartialCollectionViewViewer,
  render() {
    const link = (predicate: NamedNode) => {
      const property = this.state.properties.find(({ path }) => predicate.equals(path.term))
      if (property) {
        return this.show({ property })
      }

      return ''
    }

    return html`<div>
      <span>${link(hydra.first)}</span>
      <span>${link(hydra.previous)}</span>
      <span>${link(hydra.next)}</span>
      <span>${link(hydra.last)}</span>
    </div>`
  },
}

ViewersController.viewerMeta
  .node(hex.MembersViewer)
  .addOut(rdf.type, dash.MultiViewer)

const galleryMemberView: MultiRenderer = {
  viewer: hex.MembersViewer,
  render(members) {
    return html`${members.map(member => this.object(member, {
      resource() {
        return html`${this.state.properties.filter(({ path }) => schema.image.equals(path.term)).map(property => this.show({ property }))}`
      },
    }))}`
  },
}

const imageViewer: ViewerMatcher = {
  viewer: ex.SchemaImageViewer,
  match({ resource }) {
    return resource.has(rdf.type, schema.ImageObject).terms.length ? 50 : 0
  },
}

const imageView: Renderer = {
  viewer: ex.SchemaImageViewer,
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
  viewers: ViewerMatcher[]
  renderers: Array<Renderer<any> | MultiRenderer>
  language?: string
}

async function selectShape(arg: MultiPointer) {
  if (arg.has(rdf.type, hydra.Collection).terms.length) {
    return [runFactory(hydraCollectionShape)]
  }
  if (arg.has(rdf.type, schema.Person).terms.length) {
    return [runFactory(schemaPerson)]
  }
  if (arg.has(rdf.type, hydra.PartialCollectionView).terms.length) {
    return [runFactory(hydraPartialCollectionViewShape)]
  }

  return []
}

const Template = template<ViewStoryParams>(({ resource, viewers, renderers, ...params }) => html`
    <roadshow-view .resource="${runFactory(resource)}"
                   .shapesLoader="${selectShape}"
                   .viewers="${viewers}"
                   .renderers="${renderers}"
                   .params="${params}"
    ></roadshow-view>
    `)

export const AddressBookTable = Template.bind({})
AddressBookTable.args = {
  resource: addressBook,
  viewers: [pagerViewer],
  renderers: [tableView, pagerView, localizedLabel],
  language: '',
}

export const ProfileGallery = Template.bind({})
ProfileGallery.args = {
  resource: addressBook,
  viewers: [imageViewer],
  renderers: [galleryMemberView, imageView],
}
