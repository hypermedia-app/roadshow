/* eslint-disable import/no-extraneous-dependencies,consistent-return */
import { esbuildPlugin } from '@web/dev-server-esbuild'
import rdfjs from 'rdfjs-eds-plugin'
import { fromRollup } from '@web/dev-server-rollup'
import commonjs from '@rollup/plugin-commonjs'
import fs from 'fs'
import turtle from '@roadshow/build-helpers/transformTurtle.js'

const nodeResolveFix = {
  serve(context) {
    if (context.path.includes('node_modules') && context.path.endsWith('.ts')) {
      const path = `.${context.request.url}`.replace(/\.ts$/, '.js')
      const body = fs.readFileSync(path)
      return { body, type: 'js' }
    }
  },
}

const config = {
  groups: [
    { name: 'core', files: 'packages/roadshow/test/**/*.test.ts' },
  ],
  mimeTypes: {
    '**/*.ttl': 'js',
    '**/*.trig': 'js',
  },
  coverage: true,
  nodeResolve: true,
  plugins: [
    esbuildPlugin({ ts: true, js: true, target: 'auto' }),
    nodeResolveFix,
    rdfjs,
    fromRollup(turtle)(),
    fromRollup(commonjs)({
      exclude: [
        '**/node_modules/@open-wc/**/*',
        '**/node_modules/chai/**/*',
        '**/node_modules/chai-dom/**/*',
        '**/node_modules/sinon-chai/**/*',
      ],
    }),
  ],
}

export default config
