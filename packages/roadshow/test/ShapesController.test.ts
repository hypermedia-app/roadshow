import sinon from 'sinon'
import { expect } from '@open-wc/testing'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { ShapesController } from '../ShapesController'
import { RoadshowView } from '../index'
import { blankNode, namedNode } from './_support/clownface'
import { focusNodeState } from './_support/state'
import { ex } from './_support/ns'
import { ResourcesController } from '../ResourcesController'

describe('@hydrofoil/roadshow/ShapesController', () => {
  let host: RoadshowView
  let shapesLoader: sinon.SinonStub
  let resources: ResourcesController

  beforeEach(() => {
    shapesLoader = sinon.stub().resolves([])
    host = {
      shapesLoader,
      requestUpdate: sinon.spy(),
      addController: sinon.spy(),
    } as any
  })

  describe('.findApplicableShapes', () => {
    it('sets flag if no shape is returned', async () => {
      // given
      const controller = new ShapesController(host, resources)
      const state = {
        ...focusNodeState(),
      }

      // when
      await controller.loadShapes(state, blankNode())

      // then
      expect(state.shapesLoaded).to.be.true
    })

    it('does nothing if already loaded', async () => {
      // given
      const controller = new ShapesController(host, resources)
      const state = {
        ...focusNodeState(),
        shapesLoaded: true,
      }

      // when
      await controller.loadShapes(state, blankNode())

      // then
      expect(shapesLoader).not.to.have.been.called
      expect(host.requestUpdate).not.to.have.been.called
    })

    it('does not replace preselected shape', async () => {
      // given
      const controller = new ShapesController(host, resources)
      const state = {
        ...focusNodeState(),
        shape: fromPointer(namedNode(ex.foo)),
      }
      shapesLoader.resolves([namedNode(ex.bar)])

      // when
      await controller.loadShapes(state, blankNode())

      // then
      expect(state.shape.id).to.deep.eq(ex.foo)
      expect(state.applicableShapes.map(s => s.id)).to.deep.contain.ordered.members([
        ex.foo, ex.bar,
      ])
    })

    it('does not duplicate same shape is previously preselected', async () => {
      // given
      const controller = new ShapesController(host, resources)
      const state = {
        ...focusNodeState(),
        shape: fromPointer(namedNode(ex.foo)),
      }
      shapesLoader.resolves([namedNode(ex.bar), namedNode(ex.foo)])

      // when
      await controller.loadShapes(state, blankNode())

      // then
      expect(state.applicableShapes).to.have.length(2)
      expect(state.applicableShapes.map(s => s.id)).to.deep.contain.ordered.members([
        ex.foo, ex.bar,
      ])
    })
  })
})
