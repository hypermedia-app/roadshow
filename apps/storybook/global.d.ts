declare module '../resources/*.ttl' {
  import { Quad, DataFactory } from 'rdf-js'

  export declare interface QuadArrayFactory {
    (factory: DataFactory): Quad[]
  }

  declare const factory: QuadArrayFactory

  export default factory
}
