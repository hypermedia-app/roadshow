import FlatFilenameResolver from 'rdf-store-fs/lib/FlatFilenameResolver.js'
import $rdf from 'rdf-ext'
import fromFile from 'rdf-utils-fs/fromFile.js'
import url from 'url'

const baseIRI = 'http://localhost:3000/'
const pagesPath = new URL('../pages', import.meta.url)

const resolver = new FlatFilenameResolver({
  baseIRI,
  path: url.fileURLToPath(pagesPath),
  extension: 'ttl',
})

export default async function (term) {
  // eslint-disable-next-line no-console
  console.log(`loading ${term.value}`)
  const path = await resolver.resolve(term)
  return $rdf.dataset().import(fromFile(path.replace('%2F', '/'), {
    baseIRI,
  }))
}
