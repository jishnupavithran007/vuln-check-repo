const { boot } = require('./index.cjs');

const out = boot();
if (!out.includes('blink-v2 booting') || !out.includes('odd')) {
  console.error('blink-v2 FAILED:', out);
  process.exit(1);
}
console.log('blink-v2 PASS:', out);
