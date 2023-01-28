import module from 'module'
import { fromFile } from 'rdf-utils-fs'
import type { Stream } from 'rdf-js'

const require = module.createRequire(import.meta.url)

export function loadData(path: string): Stream {
  const fullPath = require.resolve(`./${path}.ttl`)
  return fromFile(fullPath)
}
