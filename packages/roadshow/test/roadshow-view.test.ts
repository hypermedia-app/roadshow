import { aTimeout, expect, fixture } from '@open-wc/testing'
import { dash, rdfs } from '@tpluscode/rdf-ns-builders/strict'
import { html } from 'lit'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import sinon from 'sinon'
import { clownface } from './_support/clownface'
import { Renderer } from '../index'
import type { RoadshowViewElement } from '../roadshow-view'
import '../roadshow-view'
import { ex } from './_support/ns'
import { FocusNodeViewContext, ObjectViewContext } from '../lib/ViewContext/index'

describe('@hydrofoil/roadshow/roadshow-view', () => {
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

    // when
    const view = await fixture<RoadshowViewElement>(html`<roadshow-view .resource="${resource}"
                                                                        .renderers="${renderers}"></roadshow-view>`)
    await view.updateComplete

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
    await view.updateComplete

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

  it('loads root resource from provider', async () => {
    // given
    const graph = clownface()
    const resource = graph.namedNode('foo')
      .addOut(rdfs.label, 'Foo Resource')
    async function loadResource() {
      return resource
    }

    // when
    const view = await fixture<RoadshowViewElement>(html`<roadshow-view .resourceId="${resource.term}"
                                                                        .resourceLoader="${loadResource}"></roadshow-view>`)
    await view.updateComplete

    // then
    expect(view.resource?.term).to.deep.eq(resource.term)
  })
})
