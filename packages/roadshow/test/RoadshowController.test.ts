import { expect } from '@open-wc/testing'
import { dash, rdf, sh } from '@tpluscode/rdf-ns-builders'
import { RoadshowController } from '../RoadshowController.js'
import { RoadshowView } from '../index.js'
import { blankNode } from './_support/clownface.js'
import { ex } from './_support/ns.js'

describe('@hydrofoil/roadshow/RoadshowController', () => {
  let view: RoadshowView

  beforeEach(() => {
    const resource = blankNode()

    view = {
      resource,
      params: {},
      renderers: [],
      viewers: [],
      addController() {
        //
      },
      async requestUpdate() {
        //
      },
    } as any
  })

  describe('.prepareState', () => {
    it('selects dash:shape for node state', async () => {
      // given
      view.resource?.addOut(dash.shape, ex.FooShape,
        shape => shape.addOut(rdf.type, sh.NodeShape).addOut(sh.property))
      const controller = new RoadshowController(view)

      // when
      await controller.initState()

      // then
      expect(controller.state?.shape?.id).to.deep.eq(ex.FooShape)
    })

    it('sets undefined shape when it is no annotated', async () => {
      // given
      const controller = new RoadshowController(view)

      // when
      await controller.initState()

      // then
      expect(controller.state?.shape).to.be.undefined
    })
  })
})
