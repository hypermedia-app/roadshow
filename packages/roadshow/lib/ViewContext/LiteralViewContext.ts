import type { GraphPointer } from 'clownface'
import { Literal } from '@rdfjs/types'
import ViewContextBase from './ViewContextBase'
import { LiteralViewState } from '../state'

export default class LiteralViewContext extends ViewContextBase<LiteralViewState> {
  initState(pointer: GraphPointer<Literal>): LiteralViewState {
    return {
      pointer,
      applicableViewers: [],
      locals: {},
    }
  }
}
