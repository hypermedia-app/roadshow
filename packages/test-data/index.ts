import module from 'module'
import { fromFile } from 'rdf-utils-fs'
import clownface, { AnyPointer } from 'clownface'
import $rdf from 'rdf-ext'

const require = module.createRequire(import.meta.url)

export async function loadData(...paths: string[]): Promise<AnyPointer> {
  const dataset = await paths.reduce(async (promise, path) => {
    const dataset = await promise
    const fullPath = require.resolve(`./${path}`)
    return dataset.import(fromFile(fullPath))
  }, Promise.resolve($rdf.dataset()))

  return clownface({ dataset })
}
