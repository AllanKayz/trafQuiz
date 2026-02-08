const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'src');

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, cb);
    else cb(full);
  }
}

function processFile(file) {
  if (!/\.html$|\.ts$|\.css$/.test(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let orig = content;

  // 1) Add mat-button attribute to elements with class containing 'btn'
  // Matches: <button ... class="...btn..." ...>
  content = content.replace(/<(button|a)([^>]*?)class=("|')(.*?\bbtn[-\w]*.*?)(\3)([^>]*)>/gi, (m, tag, before, quote, classes, _q, after) => {
    // if already has mat-button or mat-icon-button, skip
    if (/\bmat-/.test(m)) return m;
    // For icon-like classes keep mat-icon-button for btn-nav or btn-close naming? we'll default to mat-button
    return `<${tag}${before}class=${quote}${classes}${quote}${after} mat-button>`;
  });

  // 2) Replace class="row" with class="layout-row" (preserve additional classes)
  content = content.replace(/class=("|')([^"']*\brow\b[^"']*)(\1)/gi, (m, q, classes) => {
    const updated = classes.replace(/\brow\b/g, 'layout-row');
    return `class=${q}${updated}${q}`;
  });

  // 3) Remove console.log(...) lines in TypeScript and plain JS snippets
  content = content.replace(/^[ \t]*console\.log\([^\n]*\);?\s*$/gim, '');

  // 4) Remove debugger statements
  content = content.replace(/^[ \t]*debugger;?\s*$/gim, '');

  if (content !== orig) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Patched', file);
  }
}

walk(SRC, processFile);
console.log('Migration pass complete.');
