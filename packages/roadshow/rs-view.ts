import { RoadshowViewElement } from './element/RoadshowViewElement.js'
import { Loader } from './lib/loader.js'
import './lib/viewers/index.js'

customElements.define('rs-view', Loader(RoadshowViewElement) as any)
