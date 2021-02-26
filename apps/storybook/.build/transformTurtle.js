const {parsers} = require('@rdf-esm/formats-common')
const toStream = require('string-to-stream')
const toString =require( 'stream-to-string')
const Serializer = require('@rdfjs/serializer-rdfjs')
const { createFilter } =require ('@rollup/pluginutils')

const serializer = new Serializer({
  module: 'esm'
})

module.exports = function turtle () {
  const filter = createFilter(/ttl$/);

  return {
    name: 'turtle-transform',
    async transform ( code, id ) {
      if ( !filter( id ) ) return;
      const stream = await parsers.import('text/turtle', toStream(code))

      return {
        code: await toString(serializer.import(stream)),
        map: { mappings: '' },
        moduleSideEffects: false,
      };
    }
  };
}
