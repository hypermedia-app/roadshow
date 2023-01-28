/* eslint-disable no-redeclare */
import type { NamedNode } from '@rdfjs/types'
import { html } from 'lit'
import { FocusNodeViewer, SingleViewer, MultiViewer, viewers } from './viewers.js'

interface CustomElementClass {
  new(...args: any[]): HTMLElement
}

interface Decorator<T> {
  (arg: T): any
}

export function defineViewer(viewerUri: NamedNode, viewer: SingleViewer | MultiViewer): void
export function defineViewer(viewerUri: NamedNode, tagName: string): Decorator<CustomElementClass>
// eslint-disable-next-line consistent-return
export function defineViewer(viewerUri: NamedNode, arg: string | SingleViewer | MultiViewer): Decorator<CustomElementClass> | void {
  if (typeof arg === 'string') {
    return (classOrDescriptor: CustomElementClass) => {
      viewers.set(viewerUri, createElementViewer(arg))
    }
  }

  viewers.set(viewerUri, arg)
}

function createElementViewer(tagName: string): FocusNodeViewer {
  // eslint-disable-next-line no-new-func
  const renderFocusNode = new Function(
    'html',
    'pointer',
    'innerContent',
    `return html\`<${tagName}>$\{innerContent}</${tagName}>\``,
  )
    .bind(null, html)

  return {
    renderFocusNode,
  }
}
