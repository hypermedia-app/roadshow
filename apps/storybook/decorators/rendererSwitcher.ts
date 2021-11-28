/* eslint-disable lit-a11y/no-invalid-change-handler */
import { PropertyDecorator } from '@hydrofoil/roadshow'
import { rdfs } from '@tpluscode/rdf-ns-builders/strict'
import { html } from 'lit'
import { hex } from '../lib/ns'

export const rendererSwitcher: PropertyDecorator = {
  appliesTo(state): boolean {
    return hex.MembersViewer.equals(state.viewer)
  },
  decorate(render) {
    const { renderers } = this.state

    const switchRenderer = (e: any) => {
      const renderer = renderers.find(renderer => renderer.id.value === e.target.value)
      if (renderer) {
        this.setRenderer(renderer)
        this.controller.host.requestUpdate()
      }
    }

    return html`
      <select @change="${switchRenderer}">${renderers.map(renderer => html`
        <option ?selected="${renderer.id.equals(this.state.renderer?.id)}" value="${renderer.id.value}">
            ${renderer.meta.out(rdfs.label).value}
        </option>`)}
      </select>
      ${render()}
    `
  },
}
