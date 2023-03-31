import { xsd } from '@tpluscode/rdf-ns-builders'
import $rdf from '@rdfjs/dataset'

export const TRUE = $rdf.literal('true', xsd.boolean)
