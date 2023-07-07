import { expect, fixture, html } from '@open-wc/testing'
import sinon from 'sinon'
import $rdf from '@rdfjs/dataset'
import { RoadshowViewElement } from '../element/RoadshowViewElement.js'

describe('@hydrofoil/roadshow/rs-view', () => {
  let parse: sinon.SinonStub

  beforeEach(() => {
    parse = sinon.stub().resolves($rdf.dataset())
  })

  customElements.define('rs-view', class extends RoadshowViewElement {
    parse(arg: HTMLScriptElement) {
      return parse(arg)
    }
  })

  context('data parsed from script', () => {
    it('locates script by data-view attribute', async () => {
      // when
      const result = await fixture(html`<div>
        <script type="application/ld+json" data-view="foo">
        </script>
        <rs-view id="foo" focus-node="http://example.com/john"></rs-view>
      </div>`)
      const view = result.querySelector<RoadshowViewElement>('rs-view')
      await view?.updateComplete

      // then
      expect(parse).to.have.been.calledWith(result.querySelector('script'))
    })
  })
})
