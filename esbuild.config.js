#!/usr/bin/env node

const path = require('path')
const rails = require('esbuild-rails')
const { build } = require('esbuild')
const { copy } = require('esbuild-plugin-copy')
const { exec } = require('child_process')

build({
  entryPoints: ['application.js', 'service-worker.js'],
  bundle: true,
  sourcemap: process.argv.includes('--sourcemap'),
  minify: true,
  logLevel: 'info',
  outdir: path.join(process.cwd(), 'app/assets/builds'),
  absWorkingDir: path.join(process.cwd(), 'app/assets/javascripts'),
  watch: process.argv.includes('--watch'),
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'production'
    ),
    'process.env.RELEASE_STAGE': JSON.stringify(
      process.env.RAILS_ENV || 'production'
    ),
    'process.env.BUILD_AT': JSON.stringify(process.env.BUILD_AT || Date.now()),
    global: 'window'
  },
  plugins: [
    rails(),
    copy({
      resolveFrom: path.join(process.cwd(), 'public/assets'),
      assets: [
        {
          from: [
            './node_modules/tinymce/**/*.js',
            './node_modules/tinymce/**/*.css'
          ],
          to: ['./tinymce'],
          keepStructure: true
        }
      ]
    })
  ]
})
  .then(() => {
    console.log('⚡ Build complete! ⚡')
    exec(' workbox injectManifest')
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
