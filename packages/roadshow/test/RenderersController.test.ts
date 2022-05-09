import { dash, rdfs } from '@tpluscode/rdf-ns-builders/strict'
import { expect, nextFrame } from '@open-wc/testing'
import { roadshow } from '@hydrofoil/vocabularies/builders'
import sinon from 'sinon'
import { namedNode } from '@rdf-esm/dataset'
import { Initializable, RenderersController } from '../RenderersController'
import { Decorator, RoadshowView } from '..'
import { AnyState } from '../lib/state'
import { Renderer } from '../lib/render'
import { ViewContext } from '../lib/ViewContext/index'

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

  describe('set', () => {
    it('runs renderer meta factory with blank', () => {
      // when
      renderers.set([{
        viewer: dash.ImageViewer,
        render: () => '',
        meta(ptr) {
          ptr.addOut(rdfs.label, 'Test')
        },
      }])

      // then
      const [renderer] = renderers.get(dash.ImageViewer)
      expect(renderer.meta.term.termType).to.eq('BlankNode')
      expect(renderer.meta.out(rdfs.label).value).to.eq('Test')
    })

    it('runs renderer meta factory with given id', () => {
      // when
      renderers.set([{
        id: namedNode('test'),
        viewer: dash.ImageViewer,
        render: () => '',
        meta(ptr) {
          ptr.addOut(rdfs.label, 'Test')
        },
      }])

      // then
      const [renderer] = renderers.get(dash.ImageViewer)
      expect(renderer.meta.term).to.deep.eq(namedNode('test'))
      expect(renderer.meta.out(rdfs.label).value).to.eq('Test')
    })

    it('adds renderer without .init() as initialized', () => {
      // when
      renderers.set([{
        viewer: dash.ImageViewer,
        render: () => '',
      }])

      // then
      const [renderer] = renderers.get(dash.ImageViewer)
      expect(renderer).to.have.property('initialized', true)
    })

    it('adds renderer with .init() as uninitialized', () => {
      // when
      renderers.set([{
        viewer: dash.ImageViewer,
        render: () => '',
        init: sinon.spy(),
      }])

      // then
      const [renderer] = renderers.get(dash.ImageViewer)
      expect(renderer).to.have.property('initialized', false)
    })
  })

  describe('beginInitialize', () => {
    let renderer: Initializable<Renderer>
    let state: AnyState
    let context: ViewContext<AnyState>
    beforeEach(() => {
      renderer = {} as any
      state = {
        renderer,
        decorators: [],
        loading: new Set(),
        loadingFailed: new Set(),
      } as any
      context = { state } as any
    })

    it('sets loading flag when init begins', () => {
      // given
      renderer.viewer = dash.ImageViewer
      renderer.initialized = false
      renderer.init = sinon.spy()

      // when
      renderers.beginInitialize(context)

      // then
      expect(state.loading.size).to.have.be.greaterThan(0)
    })

    it('does nothing if no init is necessary', () => {
      // given
      renderer.viewer = dash.ImageViewer
      renderer.initialized = true
      renderer.init = sinon.spy()

      // when
      renderers.beginInitialize(context)

      // then
      expect(state.loading.size).to.have.be.eq(0)
      expect(host.requestUpdate).not.to.have.been.called
    })

    it('does nothing if already initializing', () => {
      // given
      renderer.viewer = dash.ImageViewer
      renderer.initialized = false
      renderer.init = sinon.spy()
      state.loading.add('renderer')

      // when
      renderers.beginInitialize(context)

      // then
      expect(host.requestUpdate).not.to.have.been.called
    })

    it('does nothing if init previously failed', () => {
      // given
      renderer.viewer = dash.ImageViewer
      renderer.initialized = false
      renderer.init = sinon.spy()
      state.loadingFailed.add('renderer')

      // when
      renderers.beginInitialize(context)

      // then
      expect(state.loading.size).to.have.be.eq(0)
      expect(host.requestUpdate).not.to.have.been.called
    })

    it('set failed flag when init throws', async () => {
      // given
      renderer.viewer = dash.ImageViewer
      renderer.initialized = false
      renderer.init = sinon.stub().rejects()

      // when
      await renderers.beginInitialize(context)

      // then
      expect(state.loadingFailed.size).to.have.be.eq(1)
      expect(host.requestUpdate).to.have.been.called
    })

    it('marks renderer as initialized when init finishes', async () => {
      // given
      renderer.viewer = dash.ImageViewer
      renderer.initialized = false
      renderer.init = sinon.stub().resolves()

      // when
      await renderers.beginInitialize(context)

      // then
      expect(renderer.initialized).to.be.true
      expect(renderer.init).to.have.been.calledWith(context)
      expect(host.requestUpdate).to.have.been.called
    })

    it('initializes decorator but not renderer if the latter has already been initialized', async () => {
      // given
      renderer.viewer = dash.ImageViewer
      renderer.initialized = true
      renderer.init = sinon.spy()
      const decorator: Initializable<Decorator> = {
        decorates: 'focusNode',
        init: sinon.spy(),
        initialized: false,
        appliesTo: () => true,
        decorate() {
          return ''
        },
      }
      state.decorators.push(decorator)

      // when
      await renderers.beginInitialize(context)

      // then
      expect(renderer.init).not.to.have.been.called
      expect(decorator.init).to.have.been.calledWith(context)
    })
  })
})
