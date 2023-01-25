import { directive, Directive } from 'lit/directive.js'
import { GraphPointer, MultiPointer } from 'clownface'
import { schema, sh } from '@tpluscode/rdf-ns-builders'
import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'

interface PropertyArgs {
  shape: GraphPointer
  values: MultiPointer
}

class PropertyDirective extends Directive {
  render({ shape, values }: PropertyArgs) {
    // const editor = shape.out(dash.viewer).value
    const slotName = shape.out(sh.group).out(schema.identifier).value

    const viewers = values.map(value => html`${value.value}`)

    return html`<h1 slot="${ifDefined(slotName)}">${viewers}</h1>`
  }
}

export const property = directive(PropertyDirective)
