import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { defineViewer } from '@hydrofoil/roadshow-ng'
import { canvas } from '../../ns.js'
import '../canvas-shell/canvas-header.js'
import '../canvas-shell/canvas-footer.js'
import CanvasShellBase from '../canvas-shell/CanvasShellBase.js'

@customElement('canvas-full-width')
export class FullWidthPage extends CanvasShellBase(LitElement) {
  static get styles() {
    return css`
      ${super.styles || []}

      slot[name="page-title"]::slotted(h1) {
        padding: 0;
        margin: 0;
        line-height: 1;
        font-weight: 600;
        letter-spacing: 1px;
        color: rgb(51, 51, 51);
        font-size: 28px;
        text-transform: uppercase;
      }

      #content slot {
        display: flex;
        flex-wrap: wrap;
        align-content: space-around;
      }

      #content slot::slotted(*) {
        flex: 1;
      }
    `
  }

  protected render() {
    return html`
      <canvas-header></canvas-header>
      <section id="page-title">
        <div class="container clearfix">
          <slot name="page-title"></slot>
        </div>
      </section>
      <section id="content">
        <div class="content-wrap">
          <div class="container clearfix">
            <slot></slot>
          </div>
        </div>
      </section>
      <canvas-footer></canvas-footer>
    `
  }
}

defineViewer(canvas.FullWidthPage, 'canvas-full-width')
