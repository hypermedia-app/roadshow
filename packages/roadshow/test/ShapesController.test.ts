import sinon from 'sinon'
import { expect } from '@open-wc/testing'
import { ShapesController } from '../ShapesController'
import { RoadshowView } from '../index'
import { blankNode } from './_support/clownface'
import { focusNodeState } from './_support/state'
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
  })
})
