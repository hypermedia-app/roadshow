import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { expect } from '@open-wc/testing'
import RdfResource from '@tpluscode/rdfine'
import { ShapeBundle } from '@rdfine/shacl/bundles'
import { runFactory } from '@roadshow/build-helpers/runFactory'
import { getAllProperties } from '../../lib/shape.js'

RdfResource.factory.addMixin(...ShapeBundle)

describe('@hydrofoil/roadshow/lib/shape', () => {
  describe('getAllProperties', () => {
    it('combines all properties from sh:or, sh:and and sh:xone', async () => {
      // given
      const shape = fromPointer(runFactory((await import('./shape/complex.ttl')).default))

      // when
      const properties = [...getAllProperties(shape)]

      // then
      expect(properties.map(p => p.name)).to.contain.all.members([
        'Direct property',
        'AND-ed property',
        'OR-ed property',
        'XONE-ed property',
      ])
    })

    it('find all properties in deep shapes', async () => {
      // given
      const shape = fromPointer(runFactory((await import('./shape/deep.ttl')).default))

      // when
      const properties = [...getAllProperties(shape)]

      // then
      expect(properties).to.have.length(1)
      expect(properties.map(p => p.name)).to.contain.all.members([
        'Deep property',
      ])
    })

    it('handles cycled and reused shapes', async () => {
      // given
      const shape = fromPointer(runFactory((await import('./shape/cycled.ttl')).default))

      // when
      const properties = [...getAllProperties(shape)]

      // then
      expect(properties).to.have.length(2)
      expect(properties.map(p => p.name)).to.contain.all.members([
        'Direct property',
        'AND-ed property',
      ])
    })
  })
})
