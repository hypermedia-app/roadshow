import { GraphPointer } from 'clownface'
import { isLiteral, isResource } from '../clownface'
import { ViewContext } from './index'
import { LiteralViewState, ResourceViewState } from '../state'

interface ViewStateConstructor<VS> {
  new(parent: ViewContext<any>, pointer: GraphPointer, state?: any): ViewContext<VS>
}

interface FactoryInit {
  LiteralViewContext: ViewStateConstructor<LiteralViewState>
  ResourceViewContext: ViewStateConstructor<ResourceViewState>
}

export interface Factory {
  (parent: ViewContext<any>, pointer: GraphPointer, state?: any): ViewContext<any>
}

export default function factory({ LiteralViewContext, ResourceViewContext }: FactoryInit): Factory {
  return function create(parent: ViewContext<any>, pointer: GraphPointer, state?: any): ViewContext<any> {
    if (isLiteral(pointer)) {
      return new LiteralViewContext(parent, pointer, state)
    }

    if (isResource(pointer)) {
      return new ResourceViewContext(parent, pointer, state)
    }

    throw new Error(`Cannot create view context for ${pointer.term.termType}`)
  }
}
