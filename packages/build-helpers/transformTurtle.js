/* eslint-disable @typescript-eslint/no-var-requires */
import formats from '@rdfjs/formats-common'
import toStream from 'string-to-stream'
import toString from 'stream-to-string'
import Serializer from '@rdfjs/serializer-rdfjs'
import { createFilter } from '@rollup/pluginutils'

const serializer = new Serializer({
  module: 'esm',
})

export default function turtle() {
  const filter = createFilter(/(ttl|trig)$/)

  return {
    name: 'turtle-transform',
    async transform(code, id) {
      if (!filter(id)) return
      const stream = await formats.parsers.import('application/trig', toStream(code))

      // eslint-disable-next-line consistent-return
      return {
        code: await toString(serializer.import(stream)),
        map: { mappings: '' },
        moduleSideEffects: false,
      }
    },
  }
}
