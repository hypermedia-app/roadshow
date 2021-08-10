import { ReactiveController } from 'lit'
import type { GraphPointer, MultiPointer } from 'clownface'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import type { RoadshowView } from './index'
import { createPropertyState, FocusNodeState, PropertyState } from './lib/state'

export interface ShapesLoader {
  (arg: MultiPointer): Promise<Array<GraphPointer>>
}

export class ShapesController implements ReactiveController {
  constructor(private host: RoadshowView) {
    host.addController(this)
  }

  hostConnected(): void {
    //
  }

  async loadShapes(state: FocusNodeState | PropertyState, focusNode: MultiPointer): Promise<void> {
    if (!this.host.shapesLoader || state.shapesLoaded) {
      return
    }

    state.shapesLoaded = true

    const shapePointers = await this.host.shapesLoader(focusNode)
    if (shapePointers.length === 0) {
      return
    }
    if (!state.shape) {
      state.applicableShapes = shapePointers.map((ptr: any) => fromPointer(ptr));
      [state.shape] = state.applicableShapes
    } else {
      state.applicableShapes = [
        state.shape,
        ...shapePointers.map((ptr: any) => fromPointer(ptr)).filter(found => !found.equals(state.shape)),
      ]
    }
    if ('properties' in state) {
      state.properties = state.shape.property.reduce(createPropertyState, [])
    }

    this.host.requestUpdate()
  }
}
