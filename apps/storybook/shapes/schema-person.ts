import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { schema } from '@tpluscode/rdf-ns-builders'
import RdfResource from '@tpluscode/rdfine'
import { NodeShapeBundle, PropertyShapeBundle } from '@rdfine/shacl/bundles'
import { blankNode } from '../lib/nodes'

RdfResource.factory.addMixin(...NodeShapeBundle)
RdfResource.factory.addMixin(...PropertyShapeBundle)

export default fromPointer(blankNode(), {
  targetClass: schema.Person,
  property: [{
    path: schema.givenName,
    name: 'First name',
    order: 10,
  }, {
    path: schema.familyName,
    name: 'Last name',
    order: 20,
  }, {
    path: schema.telephone,
    name: 'Phone #',
    order: 30,
  }, {
    path: schema.image,
    hidden: true,
    node: {
      targetClass: schema.ImageObject,
      property: [{
        path: schema.contentUrl,
      }],
    },
  }],
})
