import module from 'module'
import { fromFile } from 'rdf-utils-fs'
import type { Stream } from 'rdf-js'

export function loadData(path: string, base = import.meta.url): Stream | null {
  const require = module.createRequire(base)
  let fullPath: string
  try {
    fullPath = require.resolve(`${path}`)
  } catch (e: any) {
    if (e.message.includes('Cannot find module')) {
      return null
    }

    throw e
  }

  return fromFile(fullPath)
}
