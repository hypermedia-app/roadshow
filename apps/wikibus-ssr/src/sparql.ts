import StreamClient from 'sparql-http-client'
import './shacl/OptionalExpression.js'

export default new StreamClient({
  endpointUrl: 'https://query.wikibus.org/query',
})
