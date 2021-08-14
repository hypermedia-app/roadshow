import RdfResource from '@tpluscode/rdfine'
import { NodeShapeBundle, PropertyShapeBundle } from '@rdfine/shacl/bundles'
import { NodeShapeMixinEx, PropertyShapeMixinEx } from '@rdfine/dash/extensions/sh'

export type { NodeShapeMixinEx, PropertyShapeMixinEx } from '@rdfine/dash/extensions/sh'

RdfResource.factory.addMixin(...NodeShapeBundle, ...PropertyShapeBundle)
RdfResource.factory.addMixin(NodeShapeMixinEx, PropertyShapeMixinEx)
