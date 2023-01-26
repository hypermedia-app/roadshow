import { Directive, directive } from 'lit/directive.js'
import type { GraphPointer } from 'clownface'
import type { BlankNode, NamedNode } from '@rdfjs/types'
import { sh } from '@tpluscode/rdf-ns-builders'
import { findNodes } from 'clownface-shacl-path'
import { html } from 'lit'
import { property } from './property.js'

interface FocusNodeArgs {
  shape: GraphPointer
  focusNode: GraphPointer<NamedNode | BlankNode>
}

class FocusNodeDirective extends Directive {
  render({ focusNode, shape }: FocusNodeArgs) {
    // const tagName = shape.out(roadshow.selector).value || 'div'

    const properties = shape.out(sh.property).map(propShape => html`${property({
      shape: propShape,
      values: findNodes(focusNode, propShape.out(sh.path)),
    })}`)

    return html`<material-layout>${properties}</material-layout>`
  }
}

export const focusNode = directive(FocusNodeDirective)
