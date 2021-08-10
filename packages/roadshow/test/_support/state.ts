import { FocusNodeState } from '../../lib/state'
import { ex } from './ns'

export function focusNodeState(viewer = ex.FooViewer): FocusNodeState {
  return {
    properties: [],
    applicableShapes: [],
    applicableViewers: [],
    viewer,
  }
}
