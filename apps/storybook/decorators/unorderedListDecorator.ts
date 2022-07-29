import { html, Decorator, ObjectViewContext, PropertyViewContext } from '@hydrofoil/roadshow'
import { PropertyShape } from '@rdfine/shacl'
import { localizedLabel } from '@rdfjs-elements/lit-helpers/localizedLabel.js'
import { sh } from '@tpluscode/rdf-ns-builders'
import { ex } from '../lib/ns'

export const unorderedListDecorator: Decorator<PropertyViewContext | ObjectViewContext> = {
  decorates: ['object', 'property'],
  appliesTo(context: PropertyViewContext | ObjectViewContext) {
    let propertyShape: PropertyShape | undefined

    if (context.type === 'property') {
      propertyShape = context.state.propertyShape
    } else if (context.type === 'object') {
      propertyShape = context.parent?.propertyShape
    } else {
      return false
    }

    const shouldDecorate = propertyShape?.getBoolean(ex.unorderedList, { strict: false })
    return !!shouldDecorate
  },
  decorate(inner, context) {
    switch (context.type) {
      case 'property':
        return html`
          <p>${localizedLabel(context.state.propertyShape.pointer, { property: sh.name })}</p>
          <ul>${inner}</ul>`
      case 'object':
        return html`<li>${inner}</li>`
      default:
        return inner
    }
  },
}
