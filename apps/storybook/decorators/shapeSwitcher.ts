/* eslint-disable lit-a11y/no-invalid-change-handler */
import { Decorator, FocusNodeViewContext } from '@hydrofoil/roadshow'
import { html } from 'lit'

export const shapeSwitcher: Decorator<FocusNodeViewContext> = {
  decorates: 'focusNode',
  appliesTo({ state }): boolean {
    return state.applicableShapes.length > 1
  },
  decorate(inner, context) {
    const { applicableShapes } = context.state

    const switchShape = (e: any) => {
      const shape = applicableShapes.find(shape => shape.id.value === e.target.value)
      if (shape) {
        context.setShape(shape)
      }
    }

    return html`
      <div>
        <select @change="${switchShape}">${applicableShapes.map(shape => html`
          <option ?selected="${shape.id.equals(context.state.shape?.id)}" value="${shape.id.value}">
              ${shape.label}
          </option>`)}
        </select>
      </div>
      ${inner}
    `
  },
}
