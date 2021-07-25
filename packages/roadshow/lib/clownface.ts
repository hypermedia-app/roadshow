import { GraphPointer, MultiPointer } from 'clownface'

export function isGraphPointer(ptr: MultiPointer): ptr is GraphPointer {
  return !!ptr.term
}
