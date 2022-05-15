import { ReactiveController } from 'lit'
import type { GraphPointer, MultiPointer } from 'clownface'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { BlankNode, NamedNode } from '@rdfjs/types'
import { dash, sh } from '@tpluscode/rdf-ns-builders/strict'
import graphPointer from 'is-graph-pointer'
import type { RoadshowView } from './index'
import { FocusNodeState, PropertyState } from './lib/state'
import { ResourcesController } from './ResourcesController'

const LOADER_KEY = 'shapes'

export interface ShapesLoader {
  (arg: MultiPointer, state: FocusNodeState | PropertyState): Promise<Array<GraphPointer<NamedNode | BlankNode>>>
}

export class ShapesController implements ReactiveController {
  constructor(private host: RoadshowView, private resources: ResourcesController) {
    host.addController(this)
  }

  hostConnected(): void {
    //
  }

  async loadShapes(state: FocusNodeState | PropertyState, focusNode: MultiPointer): Promise<void> {
    const { shapesLoader } = this.host
    if (!shapesLoader || state.shapesLoaded) {
      state.shapesLoaded = true
      return
    }

    state.shapesLoaded = true
    state.loading.add(LOADER_KEY)

    const loadShapes = () => shapesLoader(focusNode, state)

    const shapePointers = await loadShapes()
    state.applicableShapes = shapePointers.map(ptr => fromPointer(ptr));
    [state.shape] = state.applicableShapes

    state.loading.delete(LOADER_KEY)
  }

  async loadDashShape(resource: GraphPointer) {
    const [dashShape] = resource.out(dash.shape).toArray().filter(graphPointer.isResource)

    if (dashShape) {
      if (dashShape.out(sh.property).terms.length) {
        return fromPointer(dashShape)
      }

      if (dashShape.term.termType === 'NamedNode') {
        const loaded = await this.resources.load(dashShape.term)
        if (loaded) {
          return fromPointer(loaded)
        }
      }
    }

    return undefined
  }
}
