import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from 'rollup-plugin-typescript';
import { generateSW } from 'rollup-plugin-workbox';
import { terser } from "rollup-plugin-terser";

export default {
  input: ['src/components/pyodide-console.ts'],
  output: {
    dir: 'build/rollup/dist/components',
    format: 'es',
    sourcemap: false
  },
  plugins: [
    typescript(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    terser(),
    resolve(),
    generateSW( {
      swDest: 'build/rollup/sw.js',
      globDirectory: 'build/rollup/',
      globPatterns: ["dist/**/*.{html,json,js,css}",
        "src/lib/**/*.{js, map}"],
    })
  ]
};
