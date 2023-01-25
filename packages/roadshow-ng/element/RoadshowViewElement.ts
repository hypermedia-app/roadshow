import clownface, { GraphPointer } from 'clownface'
import { property } from 'lit/decorators.js'
import type { BlankNode, NamedNode, DatasetCore } from '@rdfjs/types'
import { html, LitElement } from 'lit'
import { dash } from '@tpluscode/rdf-ns-builders'
import isGraphPointer from 'is-graph-pointer'
import { view } from '../directive/view.js'

export abstract class RoadshowViewElement extends LitElement {
  @property({ type: Object, attribute: false })
  public shape?: GraphPointer

  @property({ type: Object, attribute: false })
  public resource?: GraphPointer<BlankNode | NamedNode>

  async connectedCallback() {
    const dataGraph = document.querySelector<HTMLScriptElement>(`script[data-view="${this.id}"]`)
    const focusNode = this.getAttribute('focus-node')
    if (dataGraph && focusNode) {
      this.resource = clownface({
        dataset: await this.parse(dataGraph),
      }).namedNode(focusNode)

      const shape = this.resource.out(dash.shape)
      if (isGraphPointer.isGraphPointer(shape)) {
        this.shape = shape
      }

      this.removeAttribute('defer-hydration')
    }

    super.connectedCallback()
  }

  render() {
    if (!this.shape || !this.resource) {
      return ''
    }

    return html`${view({
      shape: this.shape,
      focusNode: this.resource,
    })}`
  }

  abstract parse(script: HTMLScriptElement): Promise<DatasetCore>
}
