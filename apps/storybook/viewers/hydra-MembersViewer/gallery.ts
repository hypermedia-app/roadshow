import { MultiRenderer } from '@hydrofoil/roadshow/index'
import { html } from 'lit'
import { rdfs, schema } from '@tpluscode/rdf-ns-builders/strict'
import { FocusNodeViewContext } from '@hydrofoil/roadshow/lib/ViewContext/index'
import { PropertyState } from '@hydrofoil/roadshow/lib/state'
import { hex } from '../../lib/ns'

function renderImage(this: FocusNodeViewContext, property: PropertyState) {
  return this.show({ property })
}

function resource(this: FocusNodeViewContext) {
  return html`${this.state.properties.filter(({ path }) => schema.image.equals(path.term)).map(renderImage.bind(this))}`
}

export const galleryView: MultiRenderer = {
  meta(ptr) {
    ptr.addOut(rdfs.label, 'gallery')
  },
  viewer: hex.MembersViewer,
  render(members) {
    return html`${members.map(member => this.object(member, { resource }))}`
  },
}
