import type { AnyPointer } from 'clownface'
import { jsonld } from '@rdfjs-elements/formats-pretty/serializers'
import toStream from 'rdf-dataset-ext/toStream.js'
import getStream from 'get-stream'
import { Stream } from 'stream'

export async function toJsonLd(ptr: AnyPointer): Promise<string> {
  const serializer = await jsonld()
  const serializerStream = <Stream>serializer.import(toStream(ptr.dataset))

  return getStream(serializerStream)
}
