/* eslint-disable import/no-duplicates */

declare module '*.ttl' {
  import { Quad, DataFactory } from 'rdf-js'

  export declare interface QuadArrayFactory {
    (arg: { factory: DataFactory }): Quad[]
  }

  declare const factory: QuadArrayFactory

  export default factory
}

declare module '*.trig' {
  import { Quad, DataFactory } from 'rdf-js'

  export declare interface QuadArrayFactory {
    (arg: { factory: DataFactory }): Quad[]
  }

  declare const factory: QuadArrayFactory

  export default factory
}
