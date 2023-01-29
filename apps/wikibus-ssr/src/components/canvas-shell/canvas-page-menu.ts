import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import CanvasShellBase from './CanvasShellBase'

@customElement('canvas-page-menu')
export class CanvasPageMenu extends CanvasShellBase(LitElement) {
  static get styles() {
    return [
      super.styles || [],
      css`
        :host([open]) slot::slotted(nav) {
          display: block !important;
        }
        
        #page-submenu-trigger {
          float: right;
        }
      `,
    ]
  }

  @property({ type: Boolean, reflect: true })
  open?: boolean

  __hideOnOutsideClick: any

  constructor() {
    super()
    this.__hideOnOutsideClick = (e: Event) => {
      if (!e.composedPath().includes(this)) {
        this.open = false
      }
    }
  }

  connectedCallback() {
    super.connectedCallback?.()
    this.id = 'page-menu'

    document.addEventListener('click', this.__hideOnOutsideClick)
  }

  disconnectedCallback() {
    super.disconnectedCallback?.()
    document.removeEventListener('click', this.__hideOnOutsideClick)
  }

  render() {
    return html`
      <div id="page-menu">
        <div id="page-menu-wrap">
          <div class="container">
            <div class="page-menu-row">
              <slot></slot>
              <div id="page-submenu-trigger" @click="${this.__toggle}" @keyup="${this.__toggle}">
                <i class="icon-reorder"></i>
              </div>
            </div>
          </div>
        </div>
      </div>`
  }

  __toggle() {
    this.open = !this.open
  }
}
