import type { AnyState } from './state'
import type { ViewContext } from './ViewContext/index'
import type { RenderFunc } from '../index'

export type Decorates = 'focusNode' | 'property' | 'object'

// eslint-disable-next-line no-use-before-define
export interface Decorator<VC extends ViewContext<S> = ViewContext<any>, S extends AnyState = VC['state']> {
  decorates: Decorates | Decorates[]
  appliesTo(state: S): boolean
  init?: () => Promise<void>
  decorate(inner: ReturnType<RenderFunc<VC>>, context: VC): ReturnType<RenderFunc<VC>>
}
