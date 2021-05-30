import type { GraphPointer } from 'clownface'
import { NodeShape } from '@rdfine/shacl'
import { dash, rdf, rdfs, sh } from '@tpluscode/rdf-ns-builders'

export function suitableShape(resource: GraphPointer): Parameters<Array<NodeShape>['filter']>[0] {
  return (shape) => {
    const types = resource.out(rdf.type).toArray() || []

    const hasTargetClass = shape.pointer.has(sh.targetClass, types).terms.length > 0
    const s1 = shape.pointer.has(rdf.type, [rdfs.Class, sh.NodeShape])

    const hasImplicitTarget = s1.terms.length > 0 && types.some(type => type.term.equals(shape.id))
    const applicable = shape.pointer.has(dash.applicableToClass, types).terms.length > 0

    return hasTargetClass || hasImplicitTarget || applicable
  }
}
