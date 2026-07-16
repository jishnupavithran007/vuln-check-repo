const { titleCase, humanize } = require('./index.cjs');

if (titleCase('hello world') !== 'Hello World') {
  console.error('js-util FAILED: titleCase');
  process.exit(1);
}
if (humanize(60000) !== '1m') {
  console.error('js-util FAILED: humanize');
  process.exit(1);
}
console.log('js-util PASS');
