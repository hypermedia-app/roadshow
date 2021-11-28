import { PropertyShape } from '@rdfine/shacl'
import { html } from 'lit'
import { GraphPointer } from 'clownface'
import { FocusNodeViewContext, PropertyViewContext } from '@hydrofoil/roadshow/lib/ViewContext/index'
import { MultiRenderer } from '@hydrofoil/roadshow/index'
import { ViewersController } from '@hydrofoil/roadshow/ViewersController'
import { dash, rdf, rdfs } from '@tpluscode/rdf-ns-builders/strict'
import { hex } from '../../lib/ns'

ViewersController.viewerMeta
  .node(hex.MembersViewer)
  .addOut(rdf.type, dash.MultiViewer)

function renderCell(this: FocusNodeViewContext, property: PropertyShape) {
  return html`<td>${this.show({ property })}</td>`
}

function renderResource(this: FocusNodeViewContext) {
  const propertyShapes = this.state.shape?.property.filter(p => !p.hidden) || []

  return html`${propertyShapes.map(renderCell.bind(this))}`
}

function renderRow(this: PropertyViewContext, member: GraphPointer) {
  return html`<tr>${this.object(member, {
    resource: renderResource,
  })}</tr>`
}

export const tableView: MultiRenderer = {
  meta(ptr) {
    ptr.addOut(rdfs.label, 'table')
  },
  viewer: hex.MembersViewer,
  render(members) {
    this.controller.initShapes(this.state, members)

    const propertyShapes = this.state.shape?.property.filter(p => !p.hidden) || []

    return html`<table>
      <thead>
        <tr>
          ${propertyShapes.map(prop => html`<td>${prop.name}</td>`)}
        </tr>
      </thead>
      <tbody>
        ${members.map(renderRow.bind(this))}
      </tbody>
    </table>`
  },
}
