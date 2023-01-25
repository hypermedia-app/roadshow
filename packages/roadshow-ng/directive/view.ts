import 'lit/experimental-hydrate-support.js'
import { Directive, directive } from 'lit/directive.js'
import type { GraphPointer } from 'clownface'
import type { BlankNode, NamedNode } from '@rdfjs/types'
import { html } from 'lit'
import { focusNode } from './focusNode.js'

interface ViewArgs {
  shape: GraphPointer
  focusNode: GraphPointer<NamedNode | BlankNode>
}

class ViewDirective extends Directive {
  render(arg: ViewArgs) {
    return html`${focusNode(arg)}`
  }
}

export const view = directive(ViewDirective)
