import module from 'module'
import { fromFile } from 'rdf-utils-fs'
import type { Stream } from 'rdf-js'

const require = module.createRequire(import.meta.url)

export function loadData(path: string): Stream | null {
  let fullPath: string
  try {
    fullPath = require.resolve(`./${path}.ttl`)
  } catch (e: any) {
    if (e.message.includes('Cannot find module')) {
      return null
    }

    throw e
  }

  return fromFile(fullPath)
}
