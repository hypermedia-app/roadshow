import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { schema } from '@tpluscode/rdf-ns-builders'
import { blankNode } from '../lib/nodes'

export default fromPointer(blankNode(), {
  targetClass: schema.ImageObject,
  property: [{
    path: schema.contentUrl,
  }],
})
