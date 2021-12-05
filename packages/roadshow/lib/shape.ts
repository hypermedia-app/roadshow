import type { GraphPointer } from 'clownface'
import type { NodeShape, PropertyShape, Shape } from '@rdfine/shacl'
import { dash, rdf, rdfs, sh } from '@tpluscode/rdf-ns-builders'
import TermSet from '@rdf-esm/term-set'
import TermMap from '@rdf-esm/term-map'

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

function getNestedShapes(shape: Shape) {
  return [...shape.and, ...shape.or, ...shape.xone]
}

export function getAllProperties(shape: NodeShape): Iterable<PropertyShape> {
  const properties = new TermMap(shape.property.map(p => [p.id, p]))
  const nestedShapes = getNestedShapes(shape)
  const visitedShapes = new TermSet()

  let currentShape = nestedShapes.pop()
  while (currentShape) {
    if (!visitedShapes.has(currentShape.id)) {
      visitedShapes.add(currentShape.id)
      currentShape.property.forEach(property => properties.set(property.id, property))
      nestedShapes.push(...getNestedShapes(currentShape))
    }

    currentShape = nestedShapes.pop()
  }

  return properties.values()
}
