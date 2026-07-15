const { pageTitle } = require('./index.cjs');

if (pageTitle('user settings') !== 'User Settings | Admin') {
  console.error('admin FAILED');
  process.exit(1);
}
console.log('admin PASS');
