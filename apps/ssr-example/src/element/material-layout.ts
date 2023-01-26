import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '@material/mwc-top-app-bar'

@customElement('material-layout')
export class MaterialLayout extends LitElement {
  render() {
    return html`<mwc-top-app-bar>
      <slot name="header" slot="title"></slot>
    </mwc-top-app-bar>`
  }
}
