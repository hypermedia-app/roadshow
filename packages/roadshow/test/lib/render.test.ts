import { expect, fixture } from '@open-wc/testing'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { NodeShape } from '@rdfine/shacl'
import { html } from 'lit'
import sinon from 'sinon'
import { dash, foaf, rdfs, sh } from '@tpluscode/rdf-ns-builders/strict'
import { Initializer } from '@tpluscode/rdfine/RdfResource'
import { render } from '../../lib/render'
import { blankNode, namedNode } from '../_support/clownface'
import { ex } from '../_support/ns'
import { RoadshowController } from '../../RoadshowController'
import { ShapesController } from '../../ShapesController'
import { focusNodeState } from '../_support/state'
import { create, FocusNodeState } from '../../lib/state'
import { FocusNodeViewContext, Params, PropertyViewContext } from '../../lib/ViewContext/index'
import '../../lib/rdfine'
import { TestRenderersController } from '../_support/TestRenderersController'

describe('@hydrofoil/roadshow/lib/render', () => {
  function createShape(init?: Initializer<NodeShape>) {
    return fromPointer(blankNode(), init)
  }
  let renderers: TestRenderersController
  let loadShapes: ShapesController['loadShapes']
  let controller: RoadshowController
  let params: Params

  beforeEach(() => {
    renderers = new TestRenderersController([
      [dash.DetailsViewer, function render(this: FocusNodeViewContext) {
        return html`${this.state.properties.map(property => html`${this.show({ property })}`)}`
      }],
    ])
    loadShapes = sinon.stub()
    controller = {
      renderers,
      viewers: {
        isMultiViewer: () => false,
        findApplicableViewers: sinon.stub().returns([]),
        get: sinon.stub().returns(blankNode()),
      },
      shapes: {
        loadShapes,
      },
      initRenderer(context: any) {
        return this.renderers.get(context.state)
      },
      initShapes() {
        //
      },
    } as any
    params = {
      language: 'en',
    }
  })

  describe('render', () => {
    it('renders using found renderer', async () => {
      // given
      const state = { ...focusNodeState(), shape: createShape() }
      const focusNode = namedNode('/foo/bar')
      renderers.set(ex.FooViewer, ({ value }) => html`<div>Resource ${value}</div>`)

      // when
      const result = await fixture(render({ state, focusNode, controller, params }))

      // then
      expect(result.textContent).to.eq('Resource /foo/bar')
    })

    describe('multi viewer', async () => {
      it('called with all property pointers', async () => {
        // given
        const shape = createShape({
          property: [{
            path: rdfs.label,
            viewer: ex.FooViewer,
          }],
        })
        sinon.stub(controller.viewers, 'isMultiViewer').returns(true)
        const focusNode = namedNode('/foo/bar')
          .addOut(rdfs.label, 'foo')
          .addOut(rdfs.label, 'bar')
          .addOut(rdfs.label, 'baz')
        const state: FocusNodeState = create({ shape, term: focusNode.term, pointer: focusNode })
        renderers.set(ex.FooViewer, ptr => html`<div>Count: ${ptr.terms.length}</div>`)

        // when
        const result = await fixture(render({ state, focusNode, controller, params }))

        // then
        expect(result.textContent).to.eq('Count: 3')
      })

      it('calling sub-renderer for individual objects', async () => {
        // given
        const shape = createShape({
          property: [{
            path: foaf.knows,
            viewer: ex.FriendsViewer,
            node: {
              types: [sh.NodeShape],
              property: [{
                types: [sh.PropertyShape],
                path: rdfs.label,
                viewer: dash.LiteralViewer,
              }, {
                types: [sh.PropertyShape],
                path: rdfs.comment,
                viewer: dash.LiteralViewer,
              }],
            },
          }],
        })
        sinon.stub(controller.viewers, 'isMultiViewer').returns(true)
        const focusNode = namedNode('/foo/bar')
          .addOut(foaf.knows, friend => friend.addOut(rdfs.label, 'Foo').addOut(rdfs.comment, 'foo comment'))
          .addOut(foaf.knows, friend => friend.addOut(rdfs.label, 'Bar').addOut(rdfs.comment, 'bar comment'))
          .addOut(foaf.knows, friend => friend.addOut(rdfs.label, 'Baz').addOut(rdfs.comment, 'baz comment'))
        const state: FocusNodeState = create({ shape, term: focusNode.term, pointer: focusNode })
        renderers.set(ex.FriendsViewer, function render(this: PropertyViewContext, friends) {
          return html`
            <table>${friends.toArray().map(object => html`
              <tr>
                ${this.object(object, {
    resource() {
      return html`${this.state.properties.map(property => html`<td>${this.show({ property })}</td>`)}`
    },
  })}
              </tr>`)}
            </table>`
        })
        renderers.set(dash.LiteralViewer, (obj: any) => obj.value)

        // when
        const result = await fixture(render({ state, focusNode, controller, params }))

        // then
        const cells = [...result.querySelectorAll('td')]
          .map(el => el.textContent)
        expect(cells).to.contain.members([
          'Foo', 'foo comment', 'Bar', 'bar comment', 'Baz', 'baz comment',
        ])
      })
    })
  })
})
