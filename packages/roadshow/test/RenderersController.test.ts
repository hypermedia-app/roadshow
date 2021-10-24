import { dash } from '@tpluscode/rdf-ns-builders/strict'
import { expect, nextFrame } from '@open-wc/testing'
import { roadshow } from '@hydrofoil/vocabularies/builders'
import sinon from 'sinon'
import { RenderersController } from '../RenderersController'
import { RoadshowView } from '..'
import { ObjectState } from '../lib/state'

describe('@hydrofoil/roadshow/RenderersController', () => {
  let host: RoadshowView
  let state: ObjectState
  let renderers: RenderersController

  beforeEach(() => {
    host = {
      requestUpdate: sinon.spy(),
      get updateComplete() {
        return nextFrame()
      },
    } as any
    state = {
      viewer: dash.ValueTableViewer,
      loading: new Set(),
      loadingFailed: new Set(),
      applicableViewers: [],
      locals: {},
    }
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
      const beforeLoad = renderers.get(state)

      // then
      expect(beforeLoad.viewer).to.deep.eq(roadshow.RendererNotFoundViewer)
    })
  })

  describe('initializable renderers', () => {
    describe('get', () => {
      it('returns loading viewer until initialized', async () => {
        // given
        renderers.set([{
          init: () => Promise.resolve(),
          viewer: dash.ValueTableViewer,
          render: () => '',
        }])

        // when
        const beforeLoad = renderers.get(state)
        expect(beforeLoad.viewer).to.deep.eq(roadshow.LoadingViewer)
        await host.updateComplete

        // then

        const afterLoad = renderers.get(state)
        expect(afterLoad.viewer).to.deep.eq(dash.ValueTableViewer)
      })

      it('returns loading failed viewer when init fails', async () => {
        // given
        renderers.set([{
          init: () => Promise.reject(),
          viewer: dash.ValueTableViewer,
          render: () => '',
        }])

        // when
        const beforeLoad = renderers.get(state)
        expect(beforeLoad.viewer).to.deep.eq(roadshow.LoadingViewer)
        await host.updateComplete

        // then

        const afterLoad = renderers.get(state)
        expect(afterLoad.viewer).to.deep.eq(roadshow.LoadingFailedViewer)
      })
    })
  })
})
