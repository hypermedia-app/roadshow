import { LimitExpression, nodeExpressions, OffsetExpression } from '@hydrofoil/shape-to-query/nodeExpressions.js'
import { GraphPointer } from 'clownface'
import { ModelFactory } from '@hydrofoil/shape-to-query/model/ModelFactory.js'
import $rdf from 'rdf-ext'
import { isGraphPointer } from 'is-graph-pointer'
import { hydra, sh } from '@tpluscode/rdf-ns-builders'

nodeExpressions.push(class HydraPagingExpression {
  static match(pointer: GraphPointer) {
    return isGraphPointer(pointer.out(hydra.limit)) || isGraphPointer(pointer.out(hydra.pageIndex))
  }

  static fromPointer(pointer: GraphPointer, factory: ModelFactory) {
    const nodes = factory.nodeExpression(pointer.out(sh.nodes))
    const limit = parseInt(pointer.out(hydra.limit).value!, 10)
    const offset = limit * (parseInt(pointer.out(hydra.pageIndex).value!, 10) - 1)

    return new LimitExpression($rdf.blankNode(), limit, new OffsetExpression($rdf.blankNode(), offset, nodes))
  }
})
