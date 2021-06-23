const path = require('path');
const rollupTypescript = require('rollup-plugin-typescript');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const env = process.env.NODE_ENV;

const isCommander = /commander/g.test(env);
const tsConfigPath = path.resolve(__dirname, "tsconfig.json")
/**
 * @type import("rollup").RollupOptions
 */
const config = {
  input: path.resolve(__dirname, isCommander ? 'src/command.ts' : 'src/index.ts'),
  output: {
    file: path.resolve(__dirname, 'dist', isCommander ? 'bundle_command.js' : 'bundle.js'),
    format: 'cjs',
    banner: isCommander ? '#!/usr/bin/env node' : '',
  },
  external: [
    'fs', 'child_process', 'path', 'readline',
    'events', 'esbuild', 'stream', 'html-minifier',
    'crypto'
  ],
  plugins: [
    resolve(),
    commonjs(),
    rollupTypescript({
      tsconfig: tsConfigPath,
    }),
  ]
}

module.exports = config
