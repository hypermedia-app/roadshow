import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { expect } from '@open-wc/testing'
import { dash, rdf, rdfs, schema, sh } from '@tpluscode/rdf-ns-builders'
import { ex } from 'test-data/ns.js'
import { blankNode } from '../_support/clownface.js'
import { create } from '../../lib/state.js'
import '../../lib/rdfine.js'

describe('@hydrofoil/roadshow/lib/state', () => {
  describe('create', () => {
    it('selects initial viewer as dash:DetailsViewer', () => {
      // given
      const shape = fromPointer(blankNode())

      // when
      const state = create({ shape, term: ex.foo })

      // then
      expect(state.viewer).to.deep.eq(dash.DetailsViewer)
    })

    it('builds PropertyState for every sh:property', () => {
      // given
      const shape = fromPointer(blankNode(), {
        property: [{
          types: [sh.PropertyShape],
          path: rdfs.label,
        }, {
          types: [sh.PropertyShape],
          path: rdfs.comment,
        }, {
          types: [sh.PropertyShape],
          path: rdf.type,
        }, {
          types: [sh.PropertyShape],
          path: schema.owns,
        }],
      })

      // when
      const state = create({ shape, term: ex.foo })

      // then
      expect(state.properties).to.have.length(4)
      expect(state.properties.map(p => p.path.term)).to.deep.contain.all.members([
        rdfs.label, rdfs.comment, rdf.type, schema.owns,
      ])
    })

    it('it ignores properties without sh:path', () => {
      // given
      const shape = fromPointer(blankNode(), {
        property: [{ }, { }, { }, { }],
      })

      // when
      const state = create({ shape, term: ex.foo })

      // then
      expect(state.properties).to.have.length(0)
    })
  })
})
