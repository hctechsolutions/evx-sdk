import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import { defineConfig } from 'rollup';

const config = defineConfig([
  // Build ESM
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    external: [
      'ethers',
      'reflect-metadata',
      'tsyringe'
    ],
    plugins: [
      json(),
      resolve({
        extensions: ['.ts', '.js', '.json'],
      }),
      commonjs({
        ignoreDynamicRequires: true,
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist',
        exclude: ['**/__tests__/**', '**/*.test.ts', '**/*.spec.ts'],
      }),
    ],
    onwarn(warning, warn) {
      // Ignorar warnings de dependências circulares
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        return;
      }
      warn(warning);
    },
  },
  
  // Build CJS
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    external: [
      'ethers',
      'reflect-metadata',
      'tsyringe'
    ],
    plugins: [
      json(),
      resolve({
        extensions: ['.ts', '.js', '.json'],
      }),
      commonjs({
        ignoreDynamicRequires: true,
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false, // Já geramos no build ESM
        exclude: ['**/__tests__/**', '**/*.test.ts', '**/*.spec.ts'],
      }),
    ],
    onwarn(warning, warn) {
      // Ignorar warnings de dependências circulares
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        return;
      }
      warn(warning);
    },
  },
  
  // Bundle de tipos TypeScript
  {
    input: 'dist/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm',
    },
    plugins: [dts()],
  },
]);

export default config; 