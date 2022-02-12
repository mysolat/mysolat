#!/usr/bin/env node

const path = require('path')
const rails = require('esbuild-rails')
const { build } = require('esbuild')

// esbuild app/assets/javascripts/*.* --bundle --sourcemap --outdir=app/assets/builds

build({
  entryPoints: ['application.js'],
  bundle: true,
  sourcemap: process.argv.includes('--sourcemap'),
  minify: true,
  logLevel: 'info',
  outdir: path.join(process.cwd(), 'app/assets/builds'),
  absWorkingDir: path.join(process.cwd(), 'app/assets/javascripts'),
  watch: process.argv.includes('--watch'),
  plugins: [rails()]
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
