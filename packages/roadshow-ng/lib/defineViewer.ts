import type { NamedNode } from '@rdfjs/types'
import { html } from 'lit'
import type { GraphPointer } from 'clownface'
import { ifDefined } from 'lit/directives/if-defined.js'
import { schema, sh } from '@tpluscode/rdf-ns-builders'
import { SingleViewer, MultiViewer, viewers } from './viewers.js'

interface MapAttributeFn {
  (arg: { shape: GraphPointer; pointer: GraphPointer }): string | boolean | undefined
}

interface CustomElementViewerDefinition {
  mapAttributes?: Record<string, MapAttributeFn>
  renderInner?(arg: {pointer: GraphPointer}): unknown
}

export function defineViewer(viewerUri: NamedNode, viewer: MultiViewer): void
export function defineViewer(viewerUri: NamedNode, tagName: string, viewer?: CustomElementViewerDefinition): void
export function defineViewer(viewerUri: NamedNode, arg: string | MultiViewer, viewer?: CustomElementViewerDefinition): void {
  if (typeof arg === 'string') {
    viewers.set(viewerUri, createElementViewer(arg, viewer))
    return
  }

  viewers.set(viewerUri, arg)
}

function createElementViewer(tagName: string, { mapAttributes = {}, renderInner }: CustomElementViewerDefinition = {}): SingleViewer {
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
        const { mapAttributes, ns } = ctx
        const { shape, innerContent } = arg
        const slot = shape.out(ns.sh.group).out(ns.schema.identifier).value
        return html\`<${tagName} ${argumentBindings} slot="$\{ifDefined(slot)}">$\{innerContent}</${tagName}>\`
    `,
  )
    .bind(null, { html, ifDefined }, { mapAttributes, ns: { sh, schema } })

  return {
    renderElement,
    renderInner,
  }
}
