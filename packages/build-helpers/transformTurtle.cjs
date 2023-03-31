/* eslint-disable @typescript-eslint/no-var-requires */
const formats = require('@rdfjs/formats-common')
const toStream = require('string-to-stream')
const toString = require('stream-to-string')
const Serializer = require('@rdfjs/serializer-rdfjs')
const { createFilter } = require('@rollup/pluginutils')

const serializer = new Serializer({
  module: 'esm',
})

module.exports = function turtle() {
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
