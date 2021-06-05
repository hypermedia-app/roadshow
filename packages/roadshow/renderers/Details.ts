import { dash, sh } from '@tpluscode/rdf-ns-builders'
import { Term } from '@rdfjs/types'
import { findNodes } from 'clownface-shacl-path'
import TermMap from '@rdf-esm/term-map'
import { html } from 'lit'
import { PropertyShape } from '@rdfine/shacl'
import type { GraphPointer } from 'clownface'
import { Renderer } from '../index'

interface ResourceObject {
  value: GraphPointer
  viewer: GraphPointer
  viewers: GraphPointer[]
  render(): unknown
}

type ResourceMap = {
  shape: PropertyShape
  objects: Array<ResourceObject>
}

export const detailsView: Renderer = {
  viewer: dash.DetailsViewer,
  render(resource, shape) {
    const propertiesInit = shape!.property.reduce<[Term, ResourceMap][]>((entries, property) => {
      const objects = findNodes(resource, property.pointer.out(sh.path))
        .map((value) => {
          const viewers = this.viewers.findApplicableViewers(value).map(v => v.pointer)
          const [viewer] = viewers
          const render = this.renderers.get(viewer?.term)

          return {
            value,
            viewer,
            viewers,
            render: () => render.call(this, value, shape),
          } as ResourceObject
        })

      return [
        ...entries,
        [property.id, { shape: property, objects }],
      ]
    }, [])
    const properties = [...new TermMap(propertiesInit).values()]

    return html`${properties.map(property => html`${property.objects.map(object => html`${object.render()}`)}`)}`
  },
}
