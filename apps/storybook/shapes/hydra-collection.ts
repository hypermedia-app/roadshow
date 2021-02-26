import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { hydra } from '@tpluscode/rdf-ns-builders'
import RdfResource from '@tpluscode/rdfine'
import { PropertyShapeBundle } from '@rdfine/shacl/bundles'
import { blankNode } from '../lib/nodes'

RdfResource.factory.addMixin(...PropertyShapeBundle)

export default fromPointer(blankNode(), {
  targetClass: hydra.Collection,
  property: {
    path: hydra.member,
  },
})
