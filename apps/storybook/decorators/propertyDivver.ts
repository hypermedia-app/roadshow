/* eslint-disable lit-a11y/no-invalid-change-handler */
import { ObjectDecorator } from '@hydrofoil/roadshow'
import { html } from 'lit'

export const propertyDivver: ObjectDecorator = {
  appliesTo(): boolean {
    return true
  },
  decorate(inner) {
    return html`<div>${inner}</div>`
  },
}
