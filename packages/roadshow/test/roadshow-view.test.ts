import { aTimeout, expect, fixture, waitUntil } from '@open-wc/testing'
import { dash, foaf, rdfs } from '@tpluscode/rdf-ns-builders'
import { html } from 'lit'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import sinon from 'sinon'
import { roadshow } from '@hydrofoil/vocabularies/builders'
import { clownface } from './_support/clownface.js'
import { Renderer } from '../index.js'
import type { RoadshowViewElement } from '../roadshow-view.js'
import '../roadshow-view.js'
import { ex } from './_support/ns.js'
import { FocusNodeViewContext, ObjectViewContext } from '../lib/ViewContext/index.js'
import { ResourceLoader } from '../ResourcesController.js'

describe('@hydrofoil/roadshow/roadshow-view', () => {
  const detailsViewer: Renderer<FocusNodeViewContext> = {
    viewer: dash.DetailsViewer,
    render() {
      return html`${this.state.properties.map(property => html`${this.show({ property })}`)}`
    },
  }

  it('rendered using details viewer by default', async () => {
    // given
    const graph = clownface()
    const shape = fromPointer(graph.blankNode(), {
      property: [{
        path: rdfs.label,
        viewer: dash.LiteralViewer,
      }],
    })
    const resource = graph.namedNode('foo')
      .addOut(rdfs.label, 'Foo Resource')
      .addOut(dash.shape, shape.pointer)
    const renderers = [detailsViewer, <Renderer<ObjectViewContext>>{
      viewer: dash.LiteralViewer,
      render(obj) {
        return html`<span>${obj.value}</span>`
      },
    }]

    // when
    const view = await fixture<RoadshowViewElement>(html`<roadshow-view .resource="${resource}"
                                                                        .renderers="${renderers}"></roadshow-view>`)
    await waitUntil(() => !!view.state?.pointer)

    // then
    expect(view.renderRoot.querySelector('span')?.textContent).to.eq('Foo Resource')
  })

  it('loads shape from provider', async () => {
    // given
    const graph = clownface()
    const shape = fromPointer(graph.blankNode(), {
      property: [{
        path: rdfs.label,
        viewer: dash.LiteralViewer,
      }],
    })
    const resource = graph.namedNode('foo')
      .addOut(rdfs.label, 'Foo Resource')
    const renderers = [<Renderer<FocusNodeViewContext>>{
      viewer: dash.DetailsViewer,
      render() {
        return html`${this.state.properties.map(property => html`${this.show({ property })}`)}`
      },
    }, <Renderer<ObjectViewContext>>{
      viewer: dash.LiteralViewer,
      render(obj) {
        return html`<span>${obj.value}</span>`
      },
    }]
    async function loadShape() {
      return [shape.pointer]
    }

    // when
    const view = await fixture<RoadshowViewElement>(html`<roadshow-view .resource="${resource}"
                                                                        .renderers="${renderers}"
                                                                        .shapesLoader="${loadShape}"></roadshow-view>`)
    await waitUntil(() => !!view.state?.pointer)

    // then
    expect(view.renderRoot.querySelector('span')?.textContent).to.eq('Foo Resource')
  })

  it('loads shape from provider if it is a named node without properties', async () => {
    // given
    const graph = clownface()
    const shape = fromPointer(graph.blankNode(), {
      property: [{
        path: rdfs.label,
        viewer: dash.LiteralViewer,
      }],
    })
    const resource = graph.namedNode('foo')
      .addOut(rdfs.label, 'Foo Resource')
      .addOut(dash.shape, ex.FooShape)
    const renderers = [<Renderer<FocusNodeViewContext>>{
      viewer: dash.DetailsViewer,
      render() {
        return 'Foo'
      },
    }]
    const loadShape = sinon.stub().resolves(shape.pointer)

    // when
    const view = await fixture<RoadshowViewElement>(html`<roadshow-view .resource="${resource}"
                                                                        .renderers="${renderers}"
                                                                        .resourceLoader="${loadShape}"></roadshow-view>`)
    await view.updateComplete
    await aTimeout(100)

    // then
    expect(loadShape).to.have.been.calledWith(ex.FooShape)
    expect(view.renderRoot.textContent).to.eq('Foo')
  })

  describe('ResourceLoader', () => {
    it('dereferences resource when flagged', async () => {
      // given
      const graph = clownface()
      const shape = fromPointer(graph.blankNode(), {
        property: [{
          path: foaf.knows,
          [roadshow.dereference.value]: true,
          [dash.viewer.value]: dash.DetailsViewer,
          node: {
            property: {
              path: rdfs.label,
              [dash.viewer.value]: dash.LiteralViewer,
            },
          },
        }],
      })
      const resource = graph.namedNode('foo')
        .addOut(foaf.knows, graph.namedNode('friend'))
        .addOut(dash.shape, shape.pointer)
      const loadResource: ResourceLoader = async () => clownface()
        .namedNode('friend-loaded')
        .addOut(rdfs.label, 'Fetched!')
      const renderers = [detailsViewer, <Renderer<ObjectViewContext>>{
        viewer: dash.LiteralViewer,
        render(obj) {
          return html`<span>${obj.value}</span>`
        },
      }]

      // when
      const view = await fixture<RoadshowViewElement>(html`<roadshow-view .resource="${resource}"
                                                                          .renderers="${renderers}"
                                                                          .resourceLoader="${loadResource}"></roadshow-view>`)
      await waitUntil(() => !!view.state?.pointer)

      // then
      expect(view).shadowDom.to.eq('<span>Fetched!</span>')
    })
  })
})
