/* eslint-disable no-console */
import { resolve } from 'path'
import url from 'url'
import { createReadStream } from 'fs'
import { StreamParser } from 'n3'
import type { Stream } from 'rdf-js'

export function loadData(path: string, base = import.meta.url): Stream | null {
  const parser = new StreamParser({ format: 'text/n3' })
  let fullPath: string
  try {
    fullPath = resolve(url.fileURLToPath(new URL(`${path}.ttl`, base)))
  } catch (e: any) {
    if (e.message.includes('Cannot find module')) {
      console.error(e)
      return null
    }

    throw e
  }

  return parser.import(createReadStream(fullPath))
}
