import { directive, Directive } from 'lit/directive.js'
import { GraphPointer, MultiPointer } from 'clownface'
import { dash, schema, sh } from '@tpluscode/rdf-ns-builders'
import { roadshow } from '@hydrofoil/vocabularies/builders'
import type { NamedNode } from '@rdfjs/types'
import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { viewers } from '../lib/viewers.js'

interface PropertyArgs {
  shape: GraphPointer
  values: MultiPointer
}

class PropertyDirective extends Directive {
  render({ shape, values }: PropertyArgs) {
    const viewerTerm = <NamedNode>shape.out(dash.viewer).term
    const selector = shape.out(roadshow.selector).value
    const slot = shape.out(sh.group).out(schema.identifier).value

    let content: unknown
    const viewer = viewers.get(viewerTerm)
    if (!viewer) {
      throw new Error(`Viewer not found '${viewerTerm?.value}'`)
    }

    if ('renderProperty' in viewer) {
      // TODO introduce value directive
      content = viewer.renderProperty(values.toArray())
    }

    if ('renderTerm' in viewer) {
      content = html`${values.toArray().map(value => html`${viewer.renderTerm(value)}`)}`
    }

    if ('renderElement' in viewer) {
      content = html`${values.toArray().map(pointer => html`${viewer.renderElement({ shape, pointer })}`)}`
    }

    if (selector === 'h1') {
      // TODO create HTML tag functions dynamically
      return html`<h1 slot="${ifDefined(slot)}">${content}</h1>`
    }

    return content
  }
}

export const property = directive(PropertyDirective)
