import type { NamedNode } from '@rdfjs/types'
import { html } from 'lit'
import type { AnyPointer, GraphPointer, MultiPointer } from 'clownface'
import { ifDefined } from 'lit/directives/if-defined.js'
import { styleMap } from 'lit/directives/style-map.js'
import { schema, sh } from '@tpluscode/rdf-ns-builders'
import onetime from 'onetime'
import { SingleViewer, MultiViewer, viewers } from './viewers.js'

interface MapAttributeFn<P extends AnyPointer> {
  (arg: { shape: GraphPointer; pointer: P }): string | boolean | undefined
}

interface CustomElementViewerDefinition<Multi extends boolean = false, P extends AnyPointer = Multi extends true ? MultiPointer : GraphPointer> {
  oneTimeInit?(): void
  multiViewer?: Multi
  mapAttributes?: Record<string, MapAttributeFn<P>>
  mapStyle?(arg: { shape: GraphPointer; pointer: P }): Record<string, string>
  renderInner?(arg: {pointer: P; shape?: GraphPointer}): unknown
}

export function defineViewer(viewerUri: NamedNode, viewer: MultiViewer | SingleViewer): void
export function defineViewer<Multi extends boolean = false>(viewerUri: NamedNode, tagName: string, viewer?: CustomElementViewerDefinition<Multi>): void
export function defineViewer(viewerUri: NamedNode, arg: string | MultiViewer | SingleViewer, viewer?: CustomElementViewerDefinition): void {
  if (typeof arg === 'string') {
    viewers.set(viewerUri, createElementViewer(arg, viewer))
    return
  }

  viewers.set(viewerUri, arg)
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

function createElementViewer(tagName: string, { multiViewer, mapAttributes = {}, mapStyle, renderInner, oneTimeInit = noop }: CustomElementViewerDefinition = {}): SingleViewer {
  const attributeBindings = Object.keys(mapAttributes)
    .map(attr => `${attr}="$\{ifDefined(mapAttributes['${attr}'](arg))}"`)
    .join(' ')

  const init = onetime(oneTimeInit)

  // eslint-disable-next-line no-new-func
  const renderElement = new Function(
    'lit',
    'ctx',
    'arg',
    `
        const { html, ifDefined, styleMap } = lit
        const { mapStyle, mapAttributes, ns, init } = ctx
        const { shape, innerContent } = arg
        const styles = mapStyle?.(arg) || {}
        const slot = shape.out(ns.sh.group).out(ns.schema.identifier).value
        init()
        return html\`<${tagName} ${attributeBindings} style="$\{styleMap(styles)}" slot="$\{ifDefined(slot)}">$\{innerContent}</${tagName}>\`
    `,
  )
    .bind(null, { html, ifDefined, styleMap }, { mapStyle, mapAttributes, ns: { sh, schema }, init })

  return {
    multiViewer,
    renderElement,
    renderInner,
  }
}
