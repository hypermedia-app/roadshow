import { esbuildPlugin } from '@web/dev-server-esbuild'
import { storybookPlugin } from '@web/dev-server-storybook'
import { fromRollup } from '@web/dev-server-rollup'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import rdfjs from 'rdfjs-eds-plugin'
import turtle from '@roadshow/build-helpers/transformTurtle.js'

export default {
  open: false,
  nodeResolve: true,
  rootDir: '../..',
  mimeTypes: {
    '**/*.ttl': 'js',
    '**/*.trig': 'js',
  },
  plugins: [
    esbuildPlugin({ ts: true }),
    storybookPlugin({ type: 'web-components' }),
    rdfjs,
    fromRollup(turtle)(),
    fromRollup(nodeResolve)(),
    fromRollup(commonjs)({
      exclude: [
        '**/node_modules/@open-wc/**/*',
        '**/node_modules/chai/**/*',
        '**/node_modules/chai-dom/**/*',
        '**/node_modules/sinon-chai/**/*',
        '**/node_modules/@web/**/*',
      ],
    }),
  ],
}
