import { dash, sh } from '@tpluscode/rdf-ns-builders'
import { findNodes } from 'clownface-shacl-path'
import { defineViewer } from '../defineViewer.js'
import { html } from '../../index.js'
import { property } from '../../directive/property.js'
import log from '../log.js'

defineViewer(dash.DetailsViewer, {
  renderElement(arg) {
    const shape = arg.shape.out(sh.node)
    const focusNode = arg.pointer
    const viewerPtr = shape.out(dash.viewer)
    log.info(`Focus node: ${focusNode.value}, ${viewerPtr.value}`)

    const properties = [
      ...shape.out(sh.property).toArray(),
      ...[...shape.out(sh.and).list() || []].flatMap(s => s.out(sh.property).toArray()),
    ]

    return properties.sort((a, b) => {
      const aOrder = parseInt(a.out(sh.order).value || '0', 10)
      const bOrder = parseInt(b.out(sh.order).value || '0', 10)
      return aOrder - bOrder
    })
      .map(propShape => html`${property({
        shape: propShape,
        values: findNodes(focusNode, propShape.out(sh.path)),
      })}`)
  },
})
