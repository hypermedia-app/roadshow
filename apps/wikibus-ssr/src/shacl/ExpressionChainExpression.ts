import { NodeExpression, nodeExpressions, Parameters, PatternBuilder } from '@hydrofoil/shape-to-query/nodeExpressions.js'
import { GraphPointer } from 'clownface'
import { ModelFactory } from '@hydrofoil/shape-to-query/model/ModelFactory.js'
import { Term } from 'rdf-js'
import { sh } from '@tpluscode/rdf-ns-builders'
import $rdf from 'rdf-ext'
import { ex } from '../ns.js'

nodeExpressions.push(class ExpressionChainExpression implements NodeExpression {
  static match(pointer: GraphPointer) {
    return pointer.isList()
  }

  static fromPointer(pointer: GraphPointer, factory: ModelFactory) {
    const expressions = [...pointer.list()!]

    const inner = expressions.reduceRight((right, left: any) => {
      const hasError = $rdf.traverser(() => true)
        .reduce(left, (ptr, hasError) => hasError || ptr.quad.object.equals(ex.error), false)

      if (hasError) {
        return right
      }

      return left.addOut(sh.nodes, right)
    })

    return new ExpressionChainExpression(pointer.term, factory.nodeExpression(inner))
  }

  constructor(public readonly term: Term, public first: NodeExpression) {
  }

  build(params: Parameters, builder: PatternBuilder) {
    return this.first.build(params, builder)
  }
})
