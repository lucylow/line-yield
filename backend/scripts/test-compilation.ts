#!/usr/bin/env ts-node

// Test script to verify TypeScript compilation
import { spawn } from 'child_process';
import { Logger } from '../src/utils/logger';

async function testCompilation() {
  Logger.info('Testing TypeScript compilation...');
  
  return new Promise<void>((resolve, reject) => {
    const tsc = spawn('npx', ['tsc', '--noEmit'], {
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    let stdout = '';
    let stderr = '';
    
    tsc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    tsc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    tsc.on('close', (code) => {
      if (code === 0) {
        Logger.info('✅ TypeScript compilation successful');
        resolve();
      } else {
        Logger.error('❌ TypeScript compilation failed');
        Logger.error('STDOUT:', stdout);
        Logger.error('STDERR:', stderr);
        reject(new Error(`TypeScript compilation failed with code ${code}`));
      }
    });
  });
}

// Run the test
testCompilation().catch((error) => {
  Logger.error('Compilation test failed:', error);
  process.exit(1);
});
