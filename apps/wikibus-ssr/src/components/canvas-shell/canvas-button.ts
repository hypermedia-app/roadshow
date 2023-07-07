import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import CanvasShellBase from './CanvasShellBase.js'

type Color =
  | 'white'
  | 'black'
  | 'red'
  | 'teal'
  | 'yellow'
  | 'green'
  | 'brown'
  | 'aqua'
  | 'purple'
  | 'leaf'
  | 'pink'
  | 'blue'
  | 'amber'
  | 'dirtygreen'

@customElement('canvas-button')
export class CanvasButton extends CanvasShellBase(LitElement) {
  static get styles() {
    return css`
      ${super.styles || []}

      :host([disabled]) {
        pointer-events: none;
        cursor: progress;
        opacity: 0.65;
      }
    `
  }

  @property({ type: String })
  public color?: Color

  @property({ type: String })
  public label?: string

  @property({ type: Boolean, attribute: 'three-d' })
  public threeDimensional = false

  @property({ type: Boolean })
  public rounded = false

  @property({ type: Boolean })
  public mini = false

  @property({ type: Boolean, reflect: true, attribute: 'dropdown-toggle' })
  public dropdownToggle = false

  @property({ type: Boolean, reflect: true })
  public disabled = false

  private get __buttonLight() {
    switch (this.color) {
      case 'white':
      case 'yellow':
        return 'button-light'
      default:
        return ''
    }
  }

  protected render() {
    const classes = {
      [this.__buttonLight]: true,
      'button-3d': this.threeDimensional,
      'button-rounded': this.rounded,
      'dropdown-toggle': this.dropdownToggle,
      'button-mini': this.mini,
    }

    if (this.color) {
      classes[`button-${this.color}`] = true
    }

    return html`
      <button class="button ${classMap(classes)}" ?disabled="${this.disabled}">
        <slot name="icon"></slot> <slot>${this.label}</slot>
      </button>
    `
  }
}
