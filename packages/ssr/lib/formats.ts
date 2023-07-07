import type { AnyPointer } from 'clownface'
import { JsonLdSerializer } from '@rdfjs-elements/formats-pretty'
import toStream from 'rdf-dataset-ext/toStream.js'
import getStream from 'get-stream'
import { Stream } from 'stream'

export async function toJsonLd(ptr: AnyPointer): Promise<string> {
  const serializer = new JsonLdSerializer()
  const serializerStream = <Stream><any>serializer.import(toStream(ptr.dataset))

  return getStream(serializerStream)
}
