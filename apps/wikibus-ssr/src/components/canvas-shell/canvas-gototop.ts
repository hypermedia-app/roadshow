import { css, html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { ChevronUp } from '../icons'
import CanvasShellBase from './CanvasShellBase'

export class CanvasGototop extends CanvasShellBase(LitElement) {
  private get goToTopEl() {
    return this.$('#gotoTop')
  }

  @property({ type: Boolean })
  public visible = false

  public static get styles() {
    return css`
      #gotoTop {
        display: none;
        z-index: 299;
        position: fixed;
        width: 40px;
        height: 40px;
        background-color: #333;
        background-color: rgba(0, 0, 0, 0.3);
        font-size: 20px;
        line-height: 36px;
        text-align: center;
        color: #fff;
        top: auto;
        left: auto;
        right: 30px;
        bottom: 50px;
        cursor: pointer;
        border-radius: 2px;
      }

      #gotoTop[visible] {
        display: block;
      }

      body:not(.device-touch) #gotoTop {
        transition: background-color 0.2s linear;
        -webkit-transition: background-color 0.2s linear;
        -o-transition: background-color 0.2s linear;
      }

      :host(.stretched) #gotoTop {
        bottom: 30px;
      }

      #gotoTop:hover {
        background-color: var(--theme-color);
      }
    `
  }

  public connectedCallback() {
    super.connectedCallback()

    if (this.$) {
      this.$(window).on('scroll', this.goToTopScroll.bind(this))
    }
  }

  public render() {
    return html` <div id="gotoTop" ?visible="${this.visible}">${ChevronUp()}</div> `
  }

  protected firstUpdated(): void {
    this.goToTop()
  }

  private goToTop() {
    const elementScrollSpeed = this.goToTopEl.attr('data-speed') || '700'
    const elementScrollEasing = this.goToTopEl.attr('data-easing') || 'easeOutQuad'

    this.goToTopEl.off('click').on('click', () => {
      this.$('body,html').stop(true).animate(
        {
          scrollTop: 0,
        },
        Number(elementScrollSpeed),
        elementScrollEasing,
      )
      return false
    })
  }

  private goToTopScroll() {
    const elementMobile = this.goToTopEl.attr('data-mobile')
    let elementOffset = this.goToTopEl.attr('data-offset')

    if (!elementOffset) {
      elementOffset = '450'
    }

    if (
      elementMobile !== 'true' &&
      (this.$(document.body).hasClass('device-sm') || this.$(document.body).hasClass('device-xs'))
    ) {
      return
    }

    const scrollTop = this.$(window).scrollTop()
    this.visible = (scrollTop && scrollTop > Number(elementOffset)) || false
  }
}

customElements.define('canvas-gototop', CanvasGototop)
