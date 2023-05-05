import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import CanvasShellBase from './CanvasShellBase'

@customElement('canvas-portfolio-item')
export class CanvasPortfolioItem extends CanvasShellBase(LitElement) {
  static get styles() {
    return [super.styles || [], css`
      :host {
        display: block;
      }

      .portfolio-image {
        position: relative;
        height: var(--portfolio-image-height, 200px);
        width: var(--portfolio-image-width);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .portfolio-image slot::slotted(img) {
        max-width: var(--portfolio-image-width, 100%);
        max-height: var(--portfolio-image-height);
      }

      .portfolio-overlay {
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .portfolio-overlay a {
        background-color: rgb(245, 245, 245);
        font-size: 18px;
        line-height: 40px;
        color: rgb(68, 68, 68);
        border-radius: 50%;
        backface-visibility: hidden;
        width: 40px;
        height: 40px;
      }

      .portfolio-image:hover .portfolio-overlay {
        pointer-events: all;
        opacity: 1;
      }
    `]
  }

  @property({ type: String })
  public image?: string

  @property({ type: String, attribute: 'resource-id' })
  public resourceId!: string

  render() {
    return html`
      <div class="portfolio-image">
        <a href="${this.resourceId}">
          <slot name="image">
          </slot>
        </a>

        <div class="portfolio-overlay">
          <a href="${this.resourceId}">
            <ion-icon name="ellipsis-horizontal-outline"></ion-icon>
          </a>
        </div>

      </div>

      <div class="portfolio-desc">
        <h3><a href="${this.resourceId}">
          <slot></slot>
        </a></h3>
      </div>
    `
  }
}
