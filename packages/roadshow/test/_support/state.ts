import { ex } from 'test-data/ns.js'
import { FocusNodeState } from '../../lib/state.js'

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
