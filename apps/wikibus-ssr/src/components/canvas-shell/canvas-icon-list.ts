import { css, html, LitElement } from 'lit'
import CanvasShellBase from './CanvasShellBase.js'

export class CanvasIconList extends CanvasShellBase(LitElement) {
  static get styles() {
    return [
      super.styles || [],
      css`
        ul {
          list-style: none;
        }
        
        :host(:empty) {
          display: none;
        }
        
        :host([inline]) ul {
          columns: 4;
        }
        
        @media (max-width: 600px) {
          :host([inline]) ul {
            columns: 3;
          }
        }
        
        @media (max-width: 450px) {
          :host([inline]) ul {
            columns: 2;
          }
        }
      `,
    ]
  }

  render() {
    return html`<ul class="iconlist">
      <slot></slot>
    </ul>`
  }
}

customElements.define('canvas-icon-list', CanvasIconList)
