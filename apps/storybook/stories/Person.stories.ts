import { html } from 'lit'
import { rdf, sh } from '@tpluscode/rdf-ns-builders'
import { Decorator, MultiRenderer, Renderer, ViewerMatcher } from '@hydrofoil/roadshow/index'
import { MultiPointer } from 'clownface'
import { runFactory } from '@roadshow/build-helpers/runFactory'
import { QuadArrayFactory } from '../resources/hydra-collection.ttl'
import { template } from '../lib/template'
import schemaPerson from '../shapes/schema-person.ttl'
import johnDoe from '../resources/john-doe.ttl'
import { shapeSwitcher } from '../decorators/shapeSwitcher'
import * as imageViewer from '../viewers/schema-ImageViewer'
import { divver } from '../decorators/divver'

export default {
  title: 'Person',
}

interface ViewStoryParams {
  resource: QuadArrayFactory
  viewers: ViewerMatcher[]
  renderers: Array<Renderer<any> | MultiRenderer>
  decorators?: Decorator[]
}

async function selectShape(arg: MultiPointer) {
  const shapes = runFactory(schemaPerson)

  return shapes.any().has(sh.targetClass, arg.out(rdf.type)).toArray()
}

const Template = template<ViewStoryParams>(({ resource, viewers, renderers, decorators }) => html`
  <roadshow-view .resource="${runFactory(resource)}"
                 .shapesLoader="${selectShape}"
                 .viewers="${viewers}"
                 .renderers="${renderers}"
                 .decorators="${decorators}"
  ></roadshow-view>
`)

export const ShapeSwitcher = Template.bind({})
ShapeSwitcher.args = {
  resource: johnDoe,
  viewers: [imageViewer.matcher],
  renderers: [imageViewer.renderer],
  decorators: [shapeSwitcher, divver],
}
