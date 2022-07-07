import { expect, fixture } from '@open-wc/testing'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { NodeShape } from '@rdfine/shacl'
import { html } from 'lit'
import sinon from 'sinon'
import { dash, foaf, rdf, rdfs, schema, sh, xsd } from '@tpluscode/rdf-ns-builders'
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
        get: sinon.stub().callsFake(namedNode),
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

    it('renders all objects', async () => {
      // given
      const shape = createShape({
        property: [{
          path: rdfs.label,
          viewer: ex.FooViewer,
        }],
      })
      const focusNode = namedNode('/foo/bar')
        .addOut(rdfs.label, 'foo')
        .addOut(rdfs.label, 'bar')
        .addOut(rdfs.label, 'baz')
      const state: FocusNodeState = create({ shape, term: focusNode.term, pointer: focusNode })
      renderers.set(ex.FooViewer, ptr => html`<span>${ptr.value}</span>`)

      // when
      const result = await fixture(html`<div>${render({ state, focusNode, controller, params })}</div>`)

      // then
      expect(result).dom.to.eq('<div><span>foo</span><span>bar</span><span>baz</span></div>')
    })

    it('limits rendered child objects to sh:maxCount', async () => {
      // given
      const shape = createShape({
        property: [{
          path: rdfs.label,
          viewer: ex.FooViewer,
          maxCount: 2,
        }],
      })
      const focusNode = namedNode('/foo/bar')
        .addOut(rdfs.label, 'foo')
        .addOut(rdfs.label, 'bar')
        .addOut(rdfs.label, 'baz')
      const state: FocusNodeState = create({ shape, term: focusNode.term, pointer: focusNode })
      renderers.set(ex.FooViewer, ptr => html`<span>${ptr.value}</span>`)

      // when
      const result = await fixture(html`<div>${render({ state, focusNode, controller, params })}</div>`)

      // then
      expect(result).dom.to.eq('<div><span>foo</span><span>bar</span></div>')
    })

    it('limits rendered child objects to those matching sh:datatype', async () => {
      // given
      const shape = createShape({
        property: [{
          path: rdfs.label,
          viewer: ex.FooViewer,
          datatype: xsd.integer,
        }],
      })
      const focusNode = namedNode('/foo/bar')
      focusNode
        .addOut(rdfs.label, 2)
        .addOut(rdfs.label, 'two')
        .addOut(rdfs.label, focusNode.literal('dwa', 'pl'))
        .addOut(rdfs.label, focusNode.literal('2', xsd.decimal))
      const state: FocusNodeState = create({ shape, term: focusNode.term, pointer: focusNode })
      renderers.set(ex.FooViewer, ptr => html`<span>${ptr.value}</span>`)

      // when
      const result = await fixture(html`<div>${render({ state, focusNode, controller, params })}</div>`)

      // then
      expect(result).dom.to.eq('<div><span>2</span></div>')
    })

    it('filters rendered child URI nodes by sh:class', async () => {
      // given
      const shape = createShape({
        property: [{
          path: foaf.knows,
          viewer: ex.FooViewer,
          class: foaf.Person,
        }],
      })
      const focusNode = namedNode('/foo')
        .addOut(foaf.knows, node => node.addOut(rdf.type, foaf.Person).addOut(rdfs.label, 'person'))
        .addOut(foaf.knows, node => node.addOut(rdf.type, foaf.Agent).addOut(rdfs.label, 'agent'))
        .addOut(foaf.knows, node => node.addOut(rdf.type, [foaf.Agent, foaf.Person]).addOut(rdfs.label, 'both'))
        .addOut(foaf.knows, node => node.addOut(rdfs.label, 'no type'))
      const state: FocusNodeState = create({ shape, term: focusNode.term, pointer: focusNode })
      renderers.set(ex.FooViewer, ptr => html`<span>${ptr.out(rdfs.label).value}</span>`)

      // when
      const result = await fixture(html`<div>${render({ state, focusNode, controller, params })}</div>`)

      // then
      expect(result).dom.to.eq('<div><span>person</span><span>both</span></div>')
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

      it('renders using selected viewer when overridden in .show()', async () => {
        // given
        const shape = createShape({
          property: [{
            path: schema.breadcrumb,
            viewer: ex.BreadcrumbViewer,
            node: {
              property: {
                path: schema.itemListElement,
              },
            },
          }],
        })
        const focusNode = namedNode('/page/child')
          .addOut(schema.breadcrumb, (bc) => {
            bc.addOut(schema.itemListElement, (item) => {
              item.addOut(schema.item, item.namedNode('/page'))
                .addOut(schema.name, 'Parent')
            })
          })
        const state: FocusNodeState = create({ shape, term: focusNode.term, pointer: focusNode })
        renderers.set(ex.BreadcrumbViewer, function (this: FocusNodeViewContext) {
          const [itemsProperty] = this.state.properties

          return html`<ol class="breadcrumbs">
            ${this.show({ property: itemsProperty, viewer: ex.BreadcrumbItemViewer })}
          </ol>`
        })
        renderers.set(ex.BreadcrumbItemViewer, resource => html`<li>${resource.out(schema.name).value}</li>`)

        // when
        const result = await fixture(render({ state, focusNode, controller, params }))

        // then
        expect(result).dom.to.eq(`<ol class="breadcrumbs">
          <li>Parent</li>
        </ol>`)
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

      it('limits rendered child objects to sh:maxCount', async () => {
        // given
        const shape = createShape({
          property: [{
            path: rdfs.label,
            viewer: ex.FooViewer,
            maxCount: 2,
          }],
        })
        sinon.stub(controller.viewers, 'isMultiViewer').returns(true)
        const focusNode = namedNode('/foo/bar')
          .addOut(rdfs.label, 'foo')
          .addOut(rdfs.label, 'bar')
          .addOut(rdfs.label, 'baz')
        const state: FocusNodeState = create({ shape, term: focusNode.term, pointer: focusNode })
        renderers.set(ex.FooViewer, ptr => html`<span>${ptr.values.join(',')}</span>`)

        // when
        const result = await fixture(html`<div>${render({ state, focusNode, controller, params })}</div>`)

        // then
        expect(result).dom.to.eq('<div><span>foo,bar</span></div>')
      })

      it('limits rendered child objects to those matching sh:datatype', async () => {
        // given
        const shape = createShape({
          property: [{
            path: rdfs.label,
            viewer: ex.FooViewer,
            datatype: xsd.integer,
          }],
        })
        sinon.stub(controller.viewers, 'isMultiViewer').returns(true)
        const focusNode = namedNode('/foo/bar')
        focusNode
          .addOut(rdfs.label, 2)
          .addOut(rdfs.label, 'two')
          .addOut(rdfs.label, focusNode.literal('dwa', 'pl'))
          .addOut(rdfs.label, focusNode.literal('2', xsd.decimal))
        const state: FocusNodeState = create({ shape, term: focusNode.term, pointer: focusNode })
        renderers.set(ex.FooViewer, ptr => html`<span>${ptr.values}</span>`)

        // when
        const result = await fixture(html`<div>${render({ state, focusNode, controller, params })}</div>`)

        // then
        expect(result).dom.to.eq('<div><span>2</span></div>')
      })

      it('filters rendered child URI nodes by sh:class', async () => {
        // given
        const shape = createShape({
          property: [{
            path: foaf.knows,
            viewer: ex.FooViewer,
            class: foaf.Person,
          }],
        })
        sinon.stub(controller.viewers, 'isMultiViewer').returns(true)
        const focusNode = namedNode('/foo')
          .addOut(foaf.knows, node => node.addOut(rdf.type, foaf.Person).addOut(rdfs.label, 'person'))
          .addOut(foaf.knows, node => node.addOut(rdf.type, foaf.Agent).addOut(rdfs.label, 'agent'))
          .addOut(foaf.knows, node => node.addOut(rdf.type, [foaf.Agent, foaf.Person]).addOut(rdfs.label, 'both'))
          .addOut(foaf.knows, node => node.addOut(rdfs.label, 'no type'))
        const state: FocusNodeState = create({ shape, term: focusNode.term, pointer: focusNode })
        renderers.set(ex.FooViewer, ptr => html`${ptr.out(rdfs.label).values.join(',')}`)

        // when
        const result = await fixture(html`<div>${render({ state, focusNode, controller, params })}</div>`)

        // then
        expect(result).dom.to.eq('<div>person,both</div>')
      })

      it('renders empty if there are no objects', async () => {
        // given
        const shape = createShape({
          property: [{
            path: foaf.knows,
            viewer: ex.FooViewer,
            class: foaf.Person,
          }],
        })
        sinon.stub(controller.viewers, 'isMultiViewer').returns(true)
        const focusNode = namedNode('/foo')
        const state: FocusNodeState = create({ shape, term: focusNode.term, pointer: focusNode })
        renderers.set(ex.FooViewer, () => html`Should not have renderd`)

        // when
        const result = await fixture(html`<div>${render({ state, focusNode, controller, params })}</div>`)

        // then
        expect(result).dom.to.eq('<div></div>')
      })

      it('renders empty if all object get excluded by constraints', async () => {
        // given
        const shape = createShape({
          property: [{
            path: foaf.knows,
            viewer: ex.FooViewer,
            class: schema.Person,
          }],
        })
        sinon.stub(controller.viewers, 'isMultiViewer').returns(true)
        const focusNode = namedNode('/foo')
          .addOut(foaf.knows, node => node.addOut(rdf.type, foaf.Person).addOut(rdfs.label, 'person'))
        const state: FocusNodeState = create({ shape, term: focusNode.term, pointer: focusNode })
        renderers.set(ex.FooViewer, () => html`Should not have renderd`)

        // when
        const result = await fixture(html`<div>${render({ state, focusNode, controller, params })}</div>`)

        // then
        expect(result).dom.to.eq('<div></div>')
      })
    })
  })
})
