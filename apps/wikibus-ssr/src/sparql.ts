import StreamClient from 'sparql-http-client'
import './shacl/OptionalExpression.js'
import './shacl/ExpressionChainExpression.js'
import './shacl/HydraPagingExpression.js'

export default new StreamClient({
  endpointUrl: 'https://query.wikibus.org/query',
})
