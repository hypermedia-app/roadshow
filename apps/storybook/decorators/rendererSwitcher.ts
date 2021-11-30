/* eslint-disable lit-a11y/no-invalid-change-handler */
import { Decorator, PropertyViewContext } from '@hydrofoil/roadshow'
import { rdfs } from '@tpluscode/rdf-ns-builders/strict'
import { html } from 'lit'
import { hex } from '../lib/ns'

export const rendererSwitcher: Decorator<PropertyViewContext> = {
  decorates: 'property',
  appliesTo({ state }): boolean {
    return hex.MembersViewer.equals(state.viewer)
  },
  decorate(inner, context) {
    const { renderers } = context.state

    const switchRenderer = (e: any) => {
      const renderer = renderers.find(renderer => renderer.id.value === e.target.value)
      if (renderer) {
        context.setRenderer(renderer)
      }
    }

    return html`
      <select @change="${switchRenderer}">${renderers.map(renderer => html`
        <option ?selected="${renderer.id.equals(context.state.renderer?.id)}" value="${renderer.id.value}">
          ${renderer.meta.out(rdfs.label).value}
        </option>`)}
      </select>
      ${inner}
    `
  },
}
