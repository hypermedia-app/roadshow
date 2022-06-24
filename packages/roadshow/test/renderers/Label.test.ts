import { expect, fixture, html } from '@open-wc/testing'
import { rdfs, schema, skos } from '@tpluscode/rdf-ns-builders'
import { Label } from '../../renderers/Label'
import { blankNode, namedNode } from '../_support/clownface'
import { ViewContext } from '../../lib/ViewContext/index'

describe('@hydrofoil/roadshow/renderers/Label', () => {
  let context: ViewContext<any>

  beforeEach(() => {
    context = {
      params: {
        language: 'en',
      },
    } as any
  })

  it('should not render anchor when value is a BlankNode', async () => {
    // given
    const pointer = blankNode()
      .addOut(rdfs.label, 'foo')

    // when
    const result = await fixture(html`<div>${Label.render.call(context, pointer)}</div>`)

    // then
    expect(result).dom.to.eq('<div>foo</div>')
  })

  it('should use skos:prefLabel before skos:altLabel', async () => {
    // given
    const pointer = blankNode()
      .addOut(skos.prefLabel, 'foo')
      .addOut(skos.altLabel, 'bar')

    // when
    const result = await fixture(html`<div>${Label.render.call(context, pointer)}</div>`)

    // then
    expect(result).dom.to.eq('<div>foo</div>')
  })

  it('should use skos:altLabel before rdfs:label', async () => {
    // given
    const pointer = blankNode()
      .addOut(rdfs.label, 'foo')
      .addOut(skos.altLabel, 'bar')

    // when
    const result = await fixture(html`<div>${Label.render.call(context, pointer)}</div>`)

    // then
    expect(result).dom.to.eq('<div>bar</div>')
  })

  it('should use schema:name before rdfs:label', async () => {
    // given
    const pointer = blankNode()
      .addOut(rdfs.label, 'foo')
      .addOut(schema.name, 'bar')

    // when
    const result = await fixture(html`<div>${Label.render.call(context, pointer)}</div>`)

    // then
    expect(result).dom.to.eq('<div>bar</div>')
  })

  it('should render anchor for named node', async () => {
    // given
    const pointer = namedNode('urn:foo:bar')
      .addOut(rdfs.label, 'baz')

    // when
    const result = await fixture(Label.render.call(context, pointer))

    // then
    expect(result).dom.to.eq('<a href="urn:foo:bar">baz</a>')
  })
})
