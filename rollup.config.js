import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

export default {
  input: 'script/main.js',
  output: {
    dir: 'js',
    format: 'es',
    entryFileNames: 'bundle.min.js',
    sourcemap: false,
    compact: true
  },
  plugins: [
    resolve({
      browser: true
    }),
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    }),
    copy({
      targets: [
        { src: 'Text/*', dest: 'dist/Text' },
        { src: 'css/*', dest: 'dist/css' },
        { src: 'img/**/*', dest: 'dist/img' },
        { src: 'index.html', dest: 'dist' },
        { src: 'page/*', dest: 'dist/page' }
      ],
      hook: 'writeBundle'
    })
  ]
};
