import { html } from 'lit'

export function renderNoShapeSlot() {
  return html`<slot name="no-shape">No applicable shape found...</slot>`
}

export function renderLoadingSlot() {
  return html`<slot name="loading">Loading...</slot>`
}

export function renderNoRendererSlot() {
  return html`<slot name="no-renderer">No renderer!</slot>`
}
