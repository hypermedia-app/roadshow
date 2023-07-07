import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { InlineConfig } from 'vite'

export default <InlineConfig>{
  server: {
    middlewareMode: true,
  },
  appType: 'custom',
  define: {
    global: 'window',
  },
  resolve: {
    alias: {
      // process: 'process/browser',
      stream: 'readable-stream',
      zlib: 'browserify-zlib',
      util: 'util',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        {
          name: 'fix-node-globals-polyfill',
          setup(build) {
            build.onResolve(
              { filter: /_(buffer|virtual-process-polyfill_)\.js/ },
              ({ path }) => ({ path }),
            )
          },
        },
      ],
    },
  },
}
