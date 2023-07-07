import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import CanvasShellBase from './CanvasShellBase.js'

@customElement('canvas-pager')
export class CanvasPager extends CanvasShellBase(LitElement) {
  static get styles() {
    return [
      super.styles || [],
      css`
        :host([full-width]) #counts {
          flex-grow: 1;
        }

        #counts {
          text-align: center;
        }

        ul {
          margin-bottom: 0;
          flex-wrap: wrap;
        }

        slot::slotted(a) {
          position: relative;
          display: block;
          padding: 0.5rem 0.75rem;
          margin-left: -1px;
          line-height: 1.25;
          color: #007bff;
          background-color: #fff;
          border: 1px solid #dee2e6;
          text-decoration: none;
          color: #222;
        }

        slot::slotted(a:hover) {
          border-color: transparent !important;
          color: #FFF;
          background-color: var(--theme-color);
        }

        slot::slotted(a:first-child) {
          margin-left: 0;
          border-top-left-radius: 0.25rem;
          border-bottom-left-radius: 0.25rem;
        }

        slot::slotted(a:last-child) {
          border-top-right-radius: 0.25rem;
          border-bottom-right-radius: 0.25rem;
        }
      `,
    ]
  }

  @property({ type: String, attribute: 'pager-style' })
  public pagerStyle: 'links' | 'prev-next' = 'links'

  @property({ type: Number })
  public current = 0

  @property({ type: Number })
  public total = 0

  @property({ type: String })
  public size?: 'lg' | 'sm'

  render() {
    const sizeClass = this.size === 'lg' || this.size === 'sm' ? `pagination-${this.size}` : ''

    return html`
      <ul class="pagination pagination-inside-transparent justify-content-center ${sizeClass}">
        <slot></slot>
      </ul>`
  }

  renderPrevNext() {
    return html`
      ${this.renderButton('Previous', this.previous, this.current === 0)}
      <li id="counts" class="page-item disabled">
        <a class="page-link" href="#">${this.current + 1} <span class="px-1">OF</span> ${this.total}</a>
      </li>
      ${this.renderButton('Next', this.next, this.current + 1 === this.total)}
    `
  }

  // eslint-disable-next-line class-methods-use-this
  renderButton(text: string, onClick: () => void, disabled: boolean) {
    let ariaDisabled: 'true' | undefined
    if (disabled) {
      ariaDisabled = 'true'
    }

    return html`
      <li class="page-item ${disabled ? 'disabled' : ''}">
        <button class="page-link ${disabled ? 'text-muted' : ''}"
                aria-disabled="${ifDefined(ariaDisabled)}"
                @click="${onClick}">${text}
        </button>
      </li>`
  }

  previous() {
    if (this.current === 0) return

    this.current -= 1
    this.__notify()
  }

  next() {
    if (this.current === this.total - 1) return

    this.current += 1
    this.__notify()
  }

  private __notify() {
    this.dispatchEvent(new CustomEvent('current-changed', {
      detail: {
        value: this.current,
      },
    }))
  }
}
