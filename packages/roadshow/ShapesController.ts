import { ReactiveController } from 'lit'
import { NodeShape } from '@rdfine/shacl'
import type { GraphPointer, MultiPointer } from 'clownface'
import { NamedNode, Term } from '@rdfjs/types'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { RoadshowView } from './index'
import { suitableShape } from './lib/shape'

interface FindShapeForResource<T extends Term> {
  resource: GraphPointer<T>
}

interface FindShapeForClass {
  class: MultiPointer | NamedNode
}

type FindShape<T extends Term = Term> = FindShapeForResource<T> | FindShapeForClass

export interface ShapesLoader {
  (arg: FindShape<NamedNode>): Promise<Array<GraphPointer<NamedNode>>>
}

function isUriResource(arg: FindShape): arg is (FindShapeForResource<NamedNode> | FindShapeForClass) {
  return 'class' in arg || ('resource' in arg && arg.resource.term.termType === 'NamedNode')
}

export class ShapesController implements ReactiveController {
  shapes: NodeShape[] = []
  private _load?: ShapesLoader

  constructor(private host: RoadshowView) {
  }

  hostConnected(): void {
    this.shapes = this.host.shapes
    this._load = this.host.shapesLoader
  }

  async findApplicableShape(applicableTo: FindShape): Promise<NodeShape[]> {
    if (this._load && isUriResource(applicableTo)) {
      const pointers = await this._load(applicableTo)

      if (pointers.length) {
        return pointers.map(ptr => fromPointer(ptr))
      }
    }

    if ('resource' in applicableTo) {
      return this.shapes.filter(suitableShape(applicableTo.resource))
    }

    return []
  }
}
