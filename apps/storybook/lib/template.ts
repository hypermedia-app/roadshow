import { TemplateResult, render } from 'lit'

export interface Template<T> {
  (...args: any[]): HTMLElement
  args?: Partial<T>
}

export function template<T>(component: (args: T) => TemplateResult): Template<T> {
  return (args: any) => {
    const result = component(args)
    const div = document.createElement('div')
    render(result, div)
    return div
  }
}
