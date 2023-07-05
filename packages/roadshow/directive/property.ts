import { directive, Directive } from 'lit/directive.js'
import { GraphPointer, MultiPointer } from 'clownface'
import { dash, schema, sh } from '@tpluscode/rdf-ns-builders'
import { html } from 'lit'
import { toSparql } from 'clownface-shacl-path'
import { isGraphPointer, isNamedNode } from 'is-graph-pointer'
import { MultiViewer, SingleViewer, viewers } from '../lib/viewers.js'
import log from '../lib/log.js'

interface PropertyArgs {
  shape: GraphPointer
  values: MultiPointer
}

type ViewerChain = [MultiViewer[], SingleViewer[]]

const emptyResult = html``

class PropertyDirective extends Directive {
  viewerChain?: ViewerChain

  render({ shape, values }: PropertyArgs) {
    log.info(`Property path: ${toSparql(shape.out(sh.path)).toString({ prologue: false })}`)

    const groupId = shape.out(sh.group).out(schema.identifier).value
    const [multiViewers, singleViewers] = this.prepareViewers(shape)

    const singleViewerResults = values.toArray()
      .sort((l, r) => l.value.localeCompare(r.value))
      .map(pointer => singleViewers.reduceRight<unknown>((previous, viewer, index) => {
        const innerContent = viewer.renderInner?.({ pointer, shape }) || previous

        return viewer.renderElement({
          slot: !index && !multiViewers.length ? groupId : undefined,
          pointer,
          shape,
          innerContent,
        })
      }, emptyResult))

    const content = multiViewers.reduceRight<unknown>((previous, viewer, index) => {
      const pointer = values
      const innerContent = viewer.renderInner?.({ pointer, shape }) || previous

      return viewer.renderElement({
        slot: !index ? groupId : undefined,
        pointer,
        shape,
        innerContent,
      })
    }, html`${singleViewerResults}`)

    return content
  }

  prepareViewers(shape: GraphPointer): ViewerChain {
    if (!this.viewerChain) {
      const viewerPtr = shape.out(dash.viewer)
      if (!isGraphPointer(viewerPtr)) {
        throw new Error('Property must have at most one value of `dash:viewer` property')
      }

      const pointers = viewerPtr.isList()
        ? [...viewerPtr.list()]
        : [viewerPtr]

      let [multi, single] = pointers.reduce<[MultiViewer[], SingleViewer[], boolean]>(([multi, single, previousWasSingle], current) => {
        if (!isNamedNode(current)) {
          throw new Error('Viewer must be a named node')
        }

        const viewer = viewers.get(current.term)
        if (!viewer) {
          throw new Error(`Viewer not found '${current.value}'`)
        }

        if (!viewer.multiViewer) {
          return [multi, [...single, viewer], true]
        }

        if (previousWasSingle) {
          throw new Error('SingleViewer cannot be followed by a MultiViewer')
        }

        return [[...multi, viewer], single, false]
      }, [[], [], false])
      single = single.length ? single : [<SingleViewer>viewers.get(dash.URIViewer)]
      this.viewerChain = [multi, single]
      return [multi, single]
    }

    return this.viewerChain
  }
}

export const property = directive(PropertyDirective)
