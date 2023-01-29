import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import CanvasShellBase from './CanvasShellBase'

@customElement('canvas-icon')
export class CanvasIcon extends CanvasShellBase(LitElement) {
  @property({ type: String, reflect: true })
  public icon = ''

  protected render(): unknown {
    return html`<i class="${this.icon}"></i>`
  }

  protected createRenderRoot() {
    return this
  }
}
