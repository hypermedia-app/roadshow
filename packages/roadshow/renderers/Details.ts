import { dash } from '@tpluscode/rdf-ns-builders'
import { html } from 'lit'
import { Renderer } from '../index.js'
import { FocusNodeViewContext } from '../lib/ViewContext/index.js'

export const detailsView: Renderer<FocusNodeViewContext> = {
  viewer: dash.DetailsViewer,
  render() {
    return html`${this.state.properties.map(property => html`${this.show({ property })}`)}`
  },
}
