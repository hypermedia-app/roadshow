import type { GraphPointer } from 'clownface'
import { isLiteral, isResource } from './clownface'
import LiteralRenderContext from './LiteralRenderContext'
import NodeRenderContext from './NodeRenderContext'
import { RenderContext } from '../index'

export function create(parent: RenderContext<any>, pointer: GraphPointer, state?: any): RenderContext<any> {
  if (isLiteral(pointer)) {
    return new LiteralRenderContext(parent, pointer, state)
  }

  if (isResource(pointer)) {
    return new NodeRenderContext(parent, pointer, state)
  }

  throw new Error('Cannot create view context for ')
}
