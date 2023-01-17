import { expect } from '@open-wc/testing'
import { dash } from '@tpluscode/rdf-ns-builders'
import sinon from 'sinon'
import { ViewersController } from '../ViewersController.js'
import { RoadshowView } from '../index.js'

describe('@hydrofoil/roadshow/ViewersController', () => {
  let host: RoadshowView

  beforeEach(() => {
    host = {
      addController: sinon.spy(),
    } as any
  })

  describe('.get', () => {
    it('marks multiviewer when it has that type', async () => {
      // given
      const controller = new ViewersController(host)
      await controller.loadDash()

      // when
      const isMultiViewer = controller.isMultiViewer(dash.ValueTableViewer)

      // then
      expect(isMultiViewer).to.be.true
    })
  })
})
