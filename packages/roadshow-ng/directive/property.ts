import { directive, Directive } from 'lit/directive.js'
import { GraphPointer, MultiPointer } from 'clownface'
import { dash, schema, sh } from '@tpluscode/rdf-ns-builders'
import { roadshow } from '@hydrofoil/vocabularies/builders'
import type { NamedNode } from '@rdfjs/types'
import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { toSparql } from 'clownface-shacl-path'
import { info } from 'loglevel'
import { viewers } from '../lib/viewers.js'

interface PropertyArgs {
  shape: GraphPointer
  values: MultiPointer
}

class PropertyDirective extends Directive {
  render({ shape, values }: PropertyArgs) {
    info(`Property path: ${toSparql(shape.out(sh.path)).toString({ prologue: false })}`)

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

    if (selector === 'span') {
      // TODO create HTML tag functions dynamically
      return html`<span slot="${ifDefined(slot)}">${content}</span>`
    }

    return content
  }
}

export const property = directive(PropertyDirective)
