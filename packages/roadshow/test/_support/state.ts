import { FocusNodeState } from '../../lib/state'
import { ex } from './ns'

export function focusNodeState(term = ex.foo, viewer = ex.FooViewer): FocusNodeState {
  return {
    properties: [],
    applicableShapes: [],
    applicableViewers: [],
    viewer,
    term,
    loading: new Set(),
    loadingFailed: new Set(),
  }
}
