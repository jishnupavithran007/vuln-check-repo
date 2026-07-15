const { titleCase } = require('@sandbox/js-util');
const { info } = require('@sandbox/logger');
const isOdd = require('is-odd');

function greet(name, n) {
  return info(titleCase('welcome ' + name) + ' (' + (isOdd(n) ? 'odd' : 'even') + ')');
}

module.exports = { greet };
