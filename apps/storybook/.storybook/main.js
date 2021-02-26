const { babel } = require('@rollup/plugin-babel')
const commonjs = require('@rollup/plugin-commonjs')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const turtle = require('../.build/transformTurtle')

const extensions = ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts']

module.exports = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  rollupConfig (config) {
    config.plugins.unshift(turtle())
    config.plugins.push(nodeResolve({
      extensions,
    }))
    config.plugins.push(commonjs())
    config.plugins.push(babel({
      extensions,
    }))
  },
}
