import module from 'module'
import { createReadStream } from 'fs'
import { StreamParser } from 'n3'
import type { Stream } from 'rdf-js'

export function loadData(path: string, base = import.meta.url): Stream | null {
  const parser = new StreamParser({ format: 'text/n3' })
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

  return parser.import(createReadStream(fullPath))
}
