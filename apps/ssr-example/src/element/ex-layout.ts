import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '@vaadin/app-layout/vaadin-app-layout.js'

@customElement('ex-layout')
export class ExLayout extends LitElement {
  render() {
    return html`<vaadin-app-layout>
      <slot name="header" slot="navbar"></slot>
    </vaadin-app-layout>
    `
  }
}
