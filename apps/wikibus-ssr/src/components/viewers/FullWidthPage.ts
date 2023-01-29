import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { defineViewer } from '@hydrofoil/roadshow-ng'
import { canvas } from '../../ns.js'
import '../canvas-shell/canvas-header.js'
import '../canvas-shell/canvas-footer.js'

@defineViewer(canvas.FullWidthPage, 'canvas-full-width')
@customElement('canvas-full-width')
export class FullWidthPage extends LitElement {
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
