import type { GraphPointer } from 'clownface'
import { Literal } from '@rdfjs/types'
import RenderContext from './RenderContext'
import { LiteralViewState } from './state'
import { Show } from '../index'

export default class LiteralRenderContext extends RenderContext<LiteralViewState> {
  initState(pointer: GraphPointer<Literal>): LiteralViewState {
    return {
      pointer,
      applicableViewers: [],
    }
  }

  show(arg: Show) {
    return this.parent.show(arg)
  }
}
