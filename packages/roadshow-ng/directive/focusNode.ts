import { Directive, directive } from 'lit/directive.js'
import type { GraphPointer } from 'clownface'
import type { BlankNode, NamedNode } from '@rdfjs/types'
import { dash, sh } from '@tpluscode/rdf-ns-builders'
import { findNodes } from 'clownface-shacl-path'
import { html } from 'lit'
import isGraphPointer from 'is-graph-pointer'
import { info } from 'loglevel'
import { property } from './property.js'
import { viewers } from '../lib/viewers.js'

interface FocusNodeArgs {
  shape: GraphPointer
  focusNode: GraphPointer<NamedNode | BlankNode>
}

class FocusNodeDirective extends Directive {
  render({ focusNode, shape }: FocusNodeArgs) {
    info(`Focus node: ${focusNode.value}`)
    const viewerPtr = shape.out(dash.viewer)
    if (!isGraphPointer.isNamedNode(viewerPtr)) {
      throw new Error(`dash:viewer must be a NamedNode but found ${viewerPtr.value} for shape ${shape.value}`)
    }

    const viewer = viewers.get(viewerPtr.term)
    if (!viewer) {
      throw new Error(`Viewer not found ${viewerPtr.value}`)
    }

    if (!('renderElement' in viewer)) {
      throw new Error('Focus node must be rendered with an CustomElementViewer')
    }

    const properties = [
      ...shape.out(sh.property).toArray(),
      ...[...shape.out(sh.and).list() || []].flatMap(s => s.out(sh.property).toArray()),
    ]
      .sort((a, b) => {
        const aOrder = parseInt(a.out(sh.order).value || '0', 10)
        const bOrder = parseInt(b.out(sh.order).value || '0', 10)
        return aOrder - bOrder
      })
      .map(propShape => html`${property({
        shape: propShape,
        values: findNodes(focusNode, propShape.out(sh.path)),
      })}`)

    return viewer.renderElement({
      shape,
      pointer: focusNode,
      innerContent: properties,
    })
  }
}

export const focusNode = directive(FocusNodeDirective)
