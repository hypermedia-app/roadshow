import { FocusNodeState } from '../../lib/state.js'
import { ex } from './ns.js'

export function focusNodeState(term = ex.foo, viewer = ex.FooViewer): FocusNodeState {
  return {
    properties: [],
    applicableShapes: [],
    applicableViewers: [],
    viewer,
    renderers: [],
    decorators: [],
    term,
    loading: new Set(),
    loadingFailed: new Set(),
    locals: {},
    shape: undefined,
  }
}
