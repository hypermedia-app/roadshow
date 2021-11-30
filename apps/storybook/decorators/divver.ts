/* eslint-disable lit-a11y/no-invalid-change-handler */
import { Decorator, FocusNodeViewContext, ObjectViewContext } from '@hydrofoil/roadshow'
import { html } from 'lit'

export const divver: Decorator<FocusNodeViewContext | ObjectViewContext> = {
  decorates: ['focusNode', 'object'],
  appliesTo(): boolean {
    return true
  },
  decorate(inner) {
    return html`<div>${inner}</div>`
  },
}
