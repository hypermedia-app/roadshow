import { html, fixture, expect } from '@open-wc/testing'
import { runFactory } from '@roadshow/build-helpers/runFactory.js'
import { ex } from 'test-data/ns.js'
import { view } from '../../directive/view'

describe('@hydrofoil/roadshow/directive/view', () => {
  it('renders', async () => {
    // given
    const shape = runFactory(await import('test-data/shape/only-header.ttl')).node(ex.HeaderOnlyShape)
    const focusNode = runFactory(await import('test-data/example/page.ttl')).node(ex.PageWithTitle)

    // when
    const result = await fixture(html`${view({ shape, focusNode })}`)

    // then
    expect(result).dom.to.eq(`
      <ex-layout>
        <h1 slot="header">
          Test page resource
        </h1>
      </ex-layout>
    `)
  })
})
