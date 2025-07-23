#!/usr/bin/env node

import { watch } from 'fs';
import { spawn } from 'child_process';
import path from 'path';

console.log('🔍 Starting token watcher...');
console.log('📁 Watching tokens/ directory for changes');

let buildProcess = null;
let debounceTimer = null;

function runBuild() {
  if (buildProcess) {
    console.log('⏳ Build already in progress, skipping...');
    return;
  }

  console.log('🔄 Token files changed - rebuilding...');
  
  buildProcess = spawn('npm', ['run', 'build-tokens'], {
    stdio: 'pipe'
  });

  buildProcess.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  buildProcess.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  buildProcess.on('close', (code) => {
    buildProcess = null;
    if (code === 0) {
      console.log('✅ Tokens rebuilt successfully!');
      console.log('🔄 Refresh your browser to see changes\n');
    } else {
      console.error(`❌ Build failed with code ${code}\n`);
    }
  });
}

function debounceRebuild() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  debounceTimer = setTimeout(() => {
    runBuild();
  }, 500); // Wait 500ms after last change
}

// Watch the tokens directory recursively
const watcher = watch('./tokens', { recursive: true }, (eventType, filename) => {
  if (filename && filename.endsWith('.json')) {
    console.log(`📝 ${eventType}: ${filename}`);
    debounceRebuild();
  }
});

console.log('✅ Token watcher started!');
console.log('📝 Edit any .json file in tokens/ to trigger automatic rebuild');
console.log('🔧 Press Ctrl+C to stop\n');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping token watcher...');
  watcher.close();
  if (buildProcess) {
    buildProcess.kill();
  }
  process.exit(0);
});
