import { ReactiveController } from 'lit'
import type { GraphPointer, MultiPointer } from 'clownface'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { roadshow } from '@hydrofoil/vocabularies/builders'
import { BlankNode, NamedNode } from '@rdfjs/types'
import { dash, sh } from '@tpluscode/rdf-ns-builders/strict'
import type { RoadshowView } from './index'
import { createPropertyState, FocusNodeState, PropertyState } from './lib/state'
import { isResource } from './lib/clownface'
import { ResourcesController } from './ResourcesController'

export interface ShapesLoader {
  (arg: MultiPointer): Promise<Array<GraphPointer<NamedNode | BlankNode>>>
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
      return
    }

    state.shapesLoaded = true
    const { viewer } = state

    const loadShapes = () => shapesLoader(focusNode)
    if (!state.shape) {
      state.viewer = roadshow.LoadingViewer
      await this.host.requestUpdate()

      const shapePointers = await loadShapes()

      state.applicableShapes = shapePointers.map(ptr => fromPointer(ptr));
      [state.shape] = state.applicableShapes
    } else {
      const shapePointers = await loadShapes()
      state.applicableShapes = [
        state.shape,
        ...shapePointers.map(ptr => fromPointer(ptr)).filter(found => !found.equals(state.shape)),
      ]
    }
    if ('properties' in state) {
      state.properties = state.shape?.property.reduce(createPropertyState, []) || []
    }

    state.viewer = viewer
    await this.host.requestUpdate()
  }

  async loadDashShape(resource: GraphPointer) {
    const [dashShape] = resource.out(dash.shape).toArray().filter(isResource)

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
