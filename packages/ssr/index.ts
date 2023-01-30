import * as ssr from '@lit-labs/ssr'
import { collectResult } from '@lit-labs/ssr/lib/render-result.js'
import { html } from 'lit'
import type { GraphPointer } from 'clownface'
import type { NamedNode } from '@rdfjs/types'
import '@hydrofoil/roadshow-ng/rs-view'
import { dash } from '@tpluscode/rdf-ns-builders'
import { nanoid } from 'nanoid'
import { toJsonLd } from './lib/formats.js'

interface Render {
  pointer: GraphPointer<NamedNode>
}

export async function render({ pointer }: Render): Promise<string> {
  const id = nanoid()
  const scriptTag = `
    <script type="application/ld+json" id="resource" data-view="${id}">
      ${await toJsonLd(pointer)}
    </script>`

  const view = ssr.render(html`<rs-view id="${id}"
                                        focus-node="${pointer.value}"
                                        .resource="${pointer}"
                                        .shape="${pointer.out(dash.shape)}"
  ></rs-view>`, {
    deferHydration: true,
  })

  return scriptTag + await collectResult(view)
}
