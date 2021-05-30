const path = require('path');
const rollupTypescript = require('rollup-plugin-typescript');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');

module.exports = {
  input: path.resolve(__dirname, 'src/index.ts'),
  output: {
    file: path.resolve(__dirname, 'dist', 'bundle.js'),
    format: 'cjs',
    banner: '#!/usr/bin/env node',
  },
  external: ['fs', 'child_process', 'path', 'readline', 'events'],
  plugins: [
    resolve(),
    commonjs(),
    rollupTypescript(),
  ]
}
