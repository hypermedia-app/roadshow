import { ReactiveController } from 'lit'
import { NodeShape } from '@rdfine/shacl'
import type { GraphPointer } from 'clownface'
import { RoadshowView } from './index'
import { suitableShape } from './lib/shape'

export class ShapesController implements ReactiveController {
  shapes: NodeShape[] = []

  constructor(private host: RoadshowView) {
  }

  hostConnected(): void {
    this.shapes = this.host.shapes
  }

  findApplicableShape(resource: GraphPointer): NodeShape[] {
    return this.shapes.filter(suitableShape(resource))
  }
}
