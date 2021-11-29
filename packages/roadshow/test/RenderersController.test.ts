import { dash } from '@tpluscode/rdf-ns-builders/strict'
import { expect, nextFrame } from '@open-wc/testing'
import { roadshow } from '@hydrofoil/vocabularies/builders'
import sinon from 'sinon'
import { RenderersController } from '../RenderersController'
import { RoadshowView } from '..'

describe('@hydrofoil/roadshow/RenderersController', () => {
  let host: RoadshowView
  let renderers: RenderersController

  beforeEach(() => {
    host = {
      requestUpdate: sinon.spy(),
      get updateComplete() {
        return nextFrame()
      },
    } as any
    renderers = new RenderersController(host)
    renderers.set([{
      viewer: roadshow.LoadingViewer,
      render: () => 'loading',
    }, {
      viewer: roadshow.LoadingFailedViewer,
      render: () => 'failed',
    }, {
      viewer: roadshow.RendererNotFoundViewer,
      render: () => 'not found',
    }])
  })

  describe('get', () => {
    it('returns "renderer not found" when viewer not found', async () => {
      // when
      const [beforeLoad] = renderers.get(dash.ValueTableViewer)

      // then
      expect(beforeLoad.viewer).to.deep.eq(roadshow.RendererNotFoundViewer)
    })
  })
})
