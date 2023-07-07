import htmlTags from 'html-tags/html-tags.json' assert { type: 'json' }
import { roadshow } from '@hydrofoil/vocabularies/builders/loose'
import { defineViewer } from '../defineViewer.js'

for (const htmlTag of htmlTags) {
  defineViewer(roadshow(`element-${htmlTag}`), htmlTag)
}
