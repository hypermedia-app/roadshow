import { html, fixture, expect } from '@open-wc/testing'
import { runFactory } from '@roadshow/build-helpers/runFactory.js'
import { ex } from 'test-data/ns'
import { view } from '../../directive/view'
import '../../viewers.js'
import { viewers } from '../../lib/viewers.js'

const defaultViewers = [...viewers.entries()]

describe('@hydrofoil/roadshow/directive/view', () => {
  beforeEach(() => {
    viewers.clear()
    defaultViewers.forEach(([key, value]) => viewers.set(key, value))
  })

  it('renders', async () => {
    // given
    const shape = runFactory(await import('test-data/shape/only-header.ttl')).namedNode('shape/only-header')
    const focusNode = runFactory(await import('test-data/example/page.ttl')).namedNode('example/page')
    viewers.set(ex.LayoutViewer, {
      renderElement({ innerContent }) {
        return html`<ex-layout>${innerContent}</ex-layout>`
      },
    })

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
