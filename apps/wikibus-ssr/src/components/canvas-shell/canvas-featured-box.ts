import { html, LitElement, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import CanvasShellBase from './CanvasShellBase'

@customElement('canvas-featured-box')
export class CanvasFeaturedBox extends CanvasShellBase(LitElement) {
  @property({ type: Boolean })
  public center = false

  @property({ type: Boolean })
  public outline = false

  @property({ type: Boolean })
  public effect = false

  @property({ type: Boolean })
  public light = false

  @property({ type: Boolean })
  public dark = false

  @property({ type: String })
  public title = ''

  @property({ type: String })
  public description = ''

  @property({ type: String })
  public href?: string

  @property({ type: String })
  public icon = 'line-open'

  public static get styles() {
    return [
      super.styles || [],
      css`
        :host {
          display: block;
        }

        slot[name='description'] p,
        slot[name='description']::slotted(p) {
          line-height: 1.4 !important;
        }

        #icon::slotted(img) {
          height: 64px !important;
          clip-path: circle(50%);
          -webkit-clip-path: circle(50%);
        }

        #icon::slotted(svg:not([fill='none'])) {
          fill: white;
        }

        .feature-box:not(.fbox-center) {
          display: block;
          height: 64px;
          margin-top: 4px;
          margin-bottom: 4px;
        }

        .feature-box:not(.fbox-center) slot#icon::slotted(*) {
          position: relative;
          top: -5px;
          height: 45px;
        }

        .fbox-icon i {
          display: flex !important;
          align-content: center;
          flex-wrap: wrap;
          justify-content: center;
          font-size: 3.9em !important;
        }
      `,
    ]
  }

  public render() {
    let link = html`<i><ion-icon name="${this.icon}"></ion-icon></i>`

    if (this.href) {
      link = html` <a href="${this.href}">${link}</a> `
    }

    return html`
      <div
        class="feature-box ${this.center ? 'fbox-center' : ''} ${this.outline
  ? 'fbox-outline'
  : ''} ${this.effect ? 'fbox-effect' : ''} ${this.light ? 'fbox-light' : ''} ${this.dark
  ? 'fbox-dark'
  : ''}"
      >
        <div class="fbox-icon">${link}</div>
        <h3>${this.title}</h3>
        <slot name="description"><p>${this.description}</p></slot>
      </div>
    `
  }
}
