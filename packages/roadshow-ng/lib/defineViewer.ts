import type { NamedNode } from '@rdfjs/types'
import { html } from 'lit'
import type { GraphPointer } from 'clownface'
import { ifDefined } from 'lit/directives/if-defined.js'
import { CustomElementViewer, SingleViewer, MultiViewer, viewers } from './viewers.js'

interface MapAttributeFn {
  (arg: { shape: GraphPointer; pointer: GraphPointer }): string | boolean | undefined
}

interface CustomElementViewerDefinition {
  mapAttributes?: Record<string, MapAttributeFn>
}

export function defineViewer(viewerUri: NamedNode, viewer: SingleViewer | MultiViewer): void
export function defineViewer(viewerUri: NamedNode, tagName: string, viewer?: CustomElementViewerDefinition): void
export function defineViewer(viewerUri: NamedNode, arg: string | SingleViewer | MultiViewer, viewer?: CustomElementViewerDefinition): void {
  if (typeof arg === 'string') {
    viewers.set(viewerUri, createElementViewer(arg, viewer))
    return
  }

  viewers.set(viewerUri, arg)
}

function createElementViewer(tagName: string, { mapAttributes = {} }: CustomElementViewerDefinition = {}): CustomElementViewer {
  const argumentBindings = Object.keys(mapAttributes)
    .map(attr => `${attr}="$\{ifDefined(mapAttributes['${attr}'](arg))}"`)
    .join(' ')

  // eslint-disable-next-line no-new-func
  const renderElement = new Function(
    'lit',
    'ctx',
    'arg',
    `
        const { html, ifDefined } = lit
        const { mapAttributes } = ctx
        const { shape, innerContent } = arg
        return html\`<${tagName} ${argumentBindings}>$\{innerContent}</${tagName}>\`
    `,
  )
    .bind(null, { html, ifDefined }, { mapAttributes })

  return {
    renderElement,
  }
}
