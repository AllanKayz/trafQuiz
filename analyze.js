const { FileSystem } = require('@rushstack/node-core-library');
const path = require('path');

const SRC_PATH = './src';

function analyzeFile(filePath) {
  const content = FileSystem.readFile(filePath);
  const issues = [];

  // 1. Performance: Check for Default Change Detection in Angular Components
  if (filePath.endsWith('.ts') && content.includes('@Component')) {
    if (!content.includes('ChangeDetectionStrategy.OnPush')) {
      issues.push('⚠️  Performance: Component uses Default Change Detection (Consider OnPush)');
    }
  }

  // 2. Performance: Check for Synchronous Electron IPC (Freezes UI)
  if (content.includes('ipcRenderer.sendSync')) {
    issues.push('🛑 Critical: Uses synchronous IPC (ipcRenderer.sendSync) - blocks UI thread');
  }

  // 3. Cleanliness: Debugging artifacts
  if (content.includes('console.log(')) {
    issues.push('ℹ️  Cleanliness: Contains console.log');
  }
  if (content.includes('debugger;')) {
    issues.push('🐛 Bug: Contains "debugger" statement');
  }

  // 4. Bundle Size: Check for heavy imports
  if (content.includes("import * as moment") || content.includes("import moment")) {
    issues.push('⚠️  Bundle: Moment.js detected (Consider date-fns or native Intl for smaller bundle)');
  }

  return issues;
}

function scanFolder(folderPath) {
  if (!FileSystem.exists(folderPath)) return;

  const items = FileSystem.readFolderItems(folderPath);

  for (const item of items) {
    const fullPath = path.join(folderPath, item.name);
    if (item.isDirectory()) {
      scanFolder(fullPath);
    } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.html'))) {
      const issues = analyzeFile(fullPath);
      if (issues.length > 0) {
        console.log(`\n📄 ${fullPath}`);
        issues.forEach(issue => console.log(`   ${issue}`));
      }
    }
  }
}

console.log('🔍 Starting Static Analysis of src folder...');
scanFolder(SRC_PATH);
console.log('\n✅ Analysis Complete.');
