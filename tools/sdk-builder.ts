#!/usr/bin/env tsx

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const KEEP_IN_OUTPUT_DIR = ['src'];

function getOutDir(): string {
  try {
    const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.json');
    const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8');
    const tsconfig = JSON.parse(tsconfigContent);
    
    const outDir = tsconfig.compilerOptions?.outDir || './dist';
    
    const cleanOutDir = outDir.replace(/^\.\//, '');
    return path.resolve(process.cwd(), cleanOutDir);
  } catch (error) {
    console.warn('Could not read tsconfig.json, using default dist path');
    return path.resolve(process.cwd(), 'dist');
  }
}

try {
  // Step 1: Compile TypeScript
  execSync('tsc', { stdio: 'inherit' });

  // Step 2: Clear extra compiled files
  const distPath = getOutDir();
  const items = fs.readdirSync(distPath);
  
  items.forEach(item => {
    if (!KEEP_IN_OUTPUT_DIR.includes(item)) {
      fs.rmSync(path.join(distPath, item), { recursive: true, force: true });
    }
  });

  // Step 3: Process aliases
  execSync('tsc-alias', { stdio: 'inherit' });

  // Step 4: Move files from dist/src to dist
  execSync('cpy \'dist/src/**/*\' \'dist/\' --parents', { stdio: 'inherit' });

  // Step 5: Remove already copied src
  fs.rmSync(path.join(distPath, 'src'), { recursive: true, force: true });

} catch (error) {
  process.exit(1);
}