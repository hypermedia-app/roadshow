import { parsers } from '@rdfjs/formats-common'
import toStream from 'string-to-stream'
import fromStream from 'rdf-dataset-ext/fromStream.js'
import $rdf from '@rdfjs/dataset'
import type { RoadshowViewElement } from '../element/RoadshowViewElement.js'

export function Loader<T extends abstract new(...args: any[]) => RoadshowViewElement>(Base: T): T {
  abstract class WithLoader extends Base {
    async parse(script: HTMLScriptElement) {
      const quads = parsers.import(script.type, toStream(script.textContent || ''))
      const dataset = $rdf.dataset()
      if (quads) {
        await fromStream(dataset, quads)
      }

      return dataset
    }
  }

  return WithLoader
}
