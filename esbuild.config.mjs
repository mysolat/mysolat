#!/usr/bin/env node

import * as esbuild from 'esbuild'
import { copy } from 'esbuild-plugin-copy'
import rails from 'esbuild-rails'
import path from 'path'
import { exec } from 'child_process'

const noStyle = {
  name: 'empty-css-imports',
  setup (build) {
    build.onLoad({ filter: /\.css$/ }, () => ({ contents: '' }))
  }
}

const safelistPatterns = [
  /^alert/,
  /^col/,
  /^form/,
  /^input/,
  /^dropdown/,
  /^accordion/,
  /^modal/,
  /^selectize/,
  /^snackbar/,
  /^carousel/,
  /^list-timeline/,
  /^grid/,
  /^g-/,
  /^w-/,
  /^h-/,
  /data-bs-popper/,
  /hr-text/,
  /fieldset/
]

const config = {
  entryPoints: ['javascripts/application.js', 'javascripts/service-worker.js'],
  bundle: true,
  sourcemap: process.argv.includes('--sourcemap'),
  //resolveExtensions: ['.ts', '.js'],
  logLevel: 'info',
  outdir: 'builds',
  outbase: path.join(process.cwd(), 'app/assets'),
  absWorkingDir: path.join(process.cwd(), 'app/assets'),
  metafile: true,
  entryNames: '[name]',
  minify: process.env.RAILS_ENV == 'production',
  //external: ['*.css', '*.woff', '*.png', '*.svg'],
  loader: {
    '.png': 'dataurl',
    '.woff': 'dataurl',
    '.woff2': 'dataurl',
    '.eot': 'dataurl',
    '.ttf': 'dataurl',
    '.svg': 'file'
  },
  define: {
    'process.env.RELEASE_STAGE': JSON.stringify(
      process.env.RAILS_ENV || 'production'
    ),
    'process.env.BUILD_AT': JSON.stringify(process.env.BUILD_AT || Date.now()),
    global: 'window'
  },
  // platform: 'node',
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
}

if (process.argv.includes('--watch')) {
  let context = await esbuild.context({ ...config, logLevel: 'info' })
  console.log('⚡ Build complete!, watching.. ⚡')
  exec(' workbox injectManifest workbox-config.js')
  context.watch()
} else {
  esbuild.build(config).catch(error => {
    console.error(error)
    process.exit(1)
  })
  console.log('⚡ Build complete! ⚡')
}
