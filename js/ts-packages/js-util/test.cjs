const { titleCase } = require('./index.cjs');

if (titleCase('hello world') !== 'Hello World') {
  console.error('js-util FAILED');
  process.exit(1);
}
console.log('js-util PASS');
