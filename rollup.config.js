import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const isProduction = process.env.NODE_ENV === 'production';
console.log('ENV:', process.env.NODE_ENV);

export default (async () => {
  const result = {
    input: `custom.ts`,
    output: [{
      file: 'custom.js',
      format: 'umd',
      name: 'BABYLON',
      exports: 'named',
      globals: [{ '@babylonjs/core': 'BabylonjsCore' }],
    }],
    context: 'window',
    // external modules not in bundle (i.e.: 'react')
    external: [],
    plugins: [
      nodeResolve(),
      json(),
      typescript(),
      // minimize production build
      isProduction && (await import('rollup-plugin-terser')).terser()
    ]
  }

  return result;
})
