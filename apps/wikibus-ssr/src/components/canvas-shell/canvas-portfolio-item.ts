import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { GraphPointer } from 'clownface'
import { taggedLiteral } from '@rdfjs-elements/lit-helpers/taggedLiteral.js'
import { skos, schema } from '@tpluscode/rdf-ns-builders'
import { findNodes } from 'clownface-shacl-path'
import { isGraphPointer } from 'is-graph-pointer'
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
        height: var(--portfolio-image-height);
        width: var(--portfolio-image-width);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .portfolio-image img {
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

  @property({ type: Object })
  public image?: GraphPointer

  @property({ type: Object })
  public resource!: GraphPointer

  @property({ type: Object })
  public titlePath?: GraphPointer

  private get _titlePath() {
    return isGraphPointer(this.titlePath) ? this.titlePath : this.resource.node(skos.prefLabel)
  }

  render() {
    return html`
      <div class="portfolio-image">
        <a href="${this.resource.value}">
          ${this.renderImage()}
        </a>

        <div class="portfolio-overlay">
          <a href="${this.resource.value}">
            <i class="icon-line-ellipsis"></i>
          </a>
        </div>

      </div>

      <div class="portfolio-desc">
        <h3><a href="${this.resource.value}">${taggedLiteral(findNodes(this.resource, this._titlePath))}</a></h3>
      </div>
    `
  }

  renderImage() {
    /* eslint-disable lit/no-invalid-html */
    const image = this.resource.out(schema.image)
    const thumbUrl = image.out(schema.thumbnail).out(schema.contentUrl).value
    const imageUrl = thumbUrl || image.out(schema.contentUrl).value
    const title = findNodes(this.resource, this._titlePath)
    return imageUrl
      ? html`<img src="${imageUrl}" alt="${taggedLiteral(title)} Logo">`
      : html`<img src="https://dummyimage.com/300x200/f5f5f5/64bfdb&amp;text=${taggedLiteral(title)}"
                alt="${taggedLiteral(this.resource.out(skos.prefLabel))} Logo">`
  }
}
