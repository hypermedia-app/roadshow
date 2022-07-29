import { html } from 'lit'
import { MultiRenderer, Renderer, ViewerMatcher, Decorator } from '@hydrofoil/roadshow'
import '@hydrofoil/roadshow/roadshow-view'
import { sh } from '@tpluscode/rdf-ns-builders'
import type { GraphPointer, MultiPointer } from 'clownface'
import { runFactory } from '@roadshow/build-helpers/runFactory'
import { template } from '../lib/template'
import wikiPage from '../resources/wiki-page.ttl'
import wikiPageShape from '../shapes/wiki-page.ttl'
import { localizedLabel } from '../viewers/ex-LocalLabelViewer'
import * as pagerViewer from '../viewers/hydra-PartialCollectionViewer'
import { unorderedListDecorator } from '../decorators/unorderedListDecorator'

export default {
  title: 'Property decorators',
}

interface ViewStoryParams {
  resource: GraphPointer
  viewers: ViewerMatcher[]
  renderers: Array<Renderer<any> | MultiRenderer>
  decorators?: Decorator[]
}

async function selectShape(arg: MultiPointer) {
  const shapes = runFactory(wikiPageShape)

  return shapes.any().has(sh.targetNode, arg.term).toArray()
}

const Template = template<ViewStoryParams>(({ resource, viewers, renderers, decorators }) => html`
    <roadshow-view .resource="${resource}"
                   .shapesLoader="${selectShape}"
                   .viewers="${viewers}"
                   .renderers="${renderers}"
                   .decorators="${decorators}"
    ></roadshow-view>
    `)

export const DecoratePropertyAndObject = Template.bind({})
DecoratePropertyAndObject.args = {
  resource: runFactory(wikiPage).namedNode('https://en.wikipedia.org/wiki/Van_Hool'),
  viewers: [pagerViewer.matcher],
  renderers: [localizedLabel],
  decorators: [unorderedListDecorator],
}
