import RdfResource from '@tpluscode/rdfine'
import { NodeShapeBundle, PropertyShapeBundle } from '@rdfine/shacl/bundles'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { dcterms, schema } from '@tpluscode/rdf-ns-builders'
import namespace from '@rdf-esm/namespace'
import { blankNode } from '../lib/nodes'

const wbo = namespace('https://wikibus.org/ontology#')

RdfResource.factory.addMixin(...NodeShapeBundle)
RdfResource.factory.addMixin(...PropertyShapeBundle)

export default fromPointer(blankNode(), {
  targetClass: wbo.Brochure,
  property: [{
    path: dcterms.title,
    name: 'Title',
  }, {
    path: schema.contributor,
    name: 'Contributor',
  }],
})
