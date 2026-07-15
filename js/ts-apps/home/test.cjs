const { greet } = require('./index.cjs');

const out = greet('spotter', 3);
if (!out.includes('Welcome Spotter') || !out.includes('odd')) {
  console.error('home FAILED:', out);
  process.exit(1);
}
console.log('home PASS:', out);
