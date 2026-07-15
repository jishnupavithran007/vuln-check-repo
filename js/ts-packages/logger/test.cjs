const { info } = require('./index.cjs');

const out = info('hi');
if (!out.includes('[info] hi')) {
  console.error('logger FAILED:', out);
  process.exit(1);
}
console.log('logger PASS');
