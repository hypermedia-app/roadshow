import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import CanvasShellBase from './CanvasShellBase.js'

@customElement('canvas-footer')
export class CanvasFooter extends CanvasShellBase(LitElement) {
  static get styles() {
    return css`
      ${super.styles || []}

      ion-icon {
        font-size: 20px;
        padding-top: 5px;
      }
    `
  }

  public render() {
    return html`
      <footer id="footer" class="dark">
        <div id="copyrights">
          <div class="container clearfix">
            <div class="col_half">
              <img src="https://new.wikibus.org/app/images/footer-logo.png" alt="" class="footer-logo" />

              Copyrights &copy; 2021 Some Rights Reserved.
            </div>

            <div class="col_half col_last tright">
              <div class="copyrights-menu copyright-links clearfix">
                <a href="/">Home</a>/<a href="/about">About</a>
              </div>
              <div class="fright clearfix">
                <a
                  href="https://www.facebook.com/wikibus"
                  class="social-icon si-small si-borderless nobottommargin si-facebook"
                >
                  <ion-icon name="logo-facebook"></ion-icon>
                </a>

                <a
                  href="https://twitter.com/WikibusOrg"
                  class="social-icon si-small si-borderless nobottommargin si-twitter"
                >
                  <ion-icon name="logo-twitter"></ion-icon>
                </a>

                <a
                  href="https://instagram.com/wikibusorg/"
                  class="social-icon si-small si-borderless nobottommargin si-instagram"
                >
                  <ion-icon name="logo-instagram"></ion-icon>
                </a>

                <a
                  href="https://pinterest.com/wikibus/"
                  class="social-icon si-small si-borderless nobottommargin si-pinterest"
                >
                  <ion-icon name="logo-pinterest"></ion-icon>
                </a>

                <a
                  href="https://github.com/wikibus/www.wikibus.org"
                  class="social-icon si-small si-borderless nobottommargin si-github"
                >
                  <ion-icon name="logo-github"></ion-icon>
                </a>

                <a
                  href="https://www.linkedin.com/in/tpluskiewicz/"
                  class="social-icon si-small si-borderless nobottommargin si-linkedin"
                >
                  <ion-icon name="logo-linkedin"></ion-icon>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    `
  }
}
