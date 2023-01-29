import { css, LitElement, unsafeCSS } from 'lit'
import bootstrap from '../../css/bootstrap.css?inline'
import style from '../../style.scss?inline'
import dark from '../../sass/dark.scss?inline'
import rs from '../../sass/responsive.scss?inline'
import fonts from '../../css/font-icons.css?inline'

type ShellConstructor = new (...args: any[]) => LitElement

export interface CanvasShellBase {
  $: JQueryStatic
}

type ReturnConstructor = new (...args: any[]) => LitElement & CanvasShellBase

export default function mixin<B extends ShellConstructor>(Base: B): B & ReturnConstructor {
  return class CanvasShellElement extends Base {
    private _$: JQueryStatic | null = null

    public static get styles() {
      return css`
        ${unsafeCSS(bootstrap)} ${unsafeCSS(style)} ${unsafeCSS(dark)} ${unsafeCSS(rs)} ${unsafeCSS(fonts)}
      `
    }

    public get $(): JQueryStatic {
      if (!this._$) {
        throw new Error('jQuery not initialized')
      }

      return this._$
    }

    public connectedCallback(): void {
      super.connectedCallback()

      const init = {
        $: null,
      }

      this.dispatchEvent(
        new CustomEvent('canvas-functions-init', {
          composed: true,
          detail: init,
        }),
      )

      this._$ = init.$
    }
  }
}
