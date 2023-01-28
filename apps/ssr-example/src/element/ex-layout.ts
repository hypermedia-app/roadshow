import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '@vaadin/app-layout/vaadin-app-layout.js'
import { ex } from 'test-data/ns.js'
import { defineViewer } from '@hydrofoil/roadshow-ng'

@defineViewer(ex.LayoutViewer, 'ex-layout')
@customElement('ex-layout')
export class ExLayout extends LitElement {
  render() {
    return html`<vaadin-app-layout>
      <slot name="header" slot="navbar"></slot>
    </vaadin-app-layout>
    `
  }
}
