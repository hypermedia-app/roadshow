import { NodeExpressionBase, nodeExpressions, PatternBuilder, Parameters, NodeExpression } from '@hydrofoil/shape-to-query/nodeExpressions.js'
import { GraphPointer } from 'clownface'
import { isGraphPointer } from 'is-graph-pointer'
import { sh } from '@tpluscode/rdf-ns-builders/loose'
import { sparql } from '@tpluscode/rdf-string'
import { Term } from 'rdf-js'
import { ModelFactory } from '@hydrofoil/shape-to-query/model/ModelFactory.js'

nodeExpressions.push(class OptionalExpression extends NodeExpressionBase {
  static match(pointer: GraphPointer) {
    return isGraphPointer(pointer.out(sh.optional))
  }

  static fromPointer(pointer: GraphPointer, createExpr: ModelFactory) {
    return new OptionalExpression(pointer.term, createExpr.nodeExpression(pointer.out(sh.optional)))
  }

  constructor(public readonly term: Term, public readonly expr: NodeExpression) {
    super()
  }

  protected _buildPatterns(arg: Required<Parameters>, builder: PatternBuilder) {
    const { patterns } = builder.build(this.expr, arg)

    return sparql`OPTIONAL {
      ${patterns}
    }`
  }
})
