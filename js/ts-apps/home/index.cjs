const { titleCase } = require('@sandbox/js-util');
const { info } = require('@sandbox/logger');
const isOdd = require('is-odd');
// node-fetch is CJS in v2 but ESM-only in v3 — a major upgrade breaks require().
const fetch = require('node-fetch');

function greet(name, n) {
  return info(titleCase('welcome ' + name) + ' (' + (isOdd(n) ? 'odd' : 'even') + ')');
}

async function fetchGreeting(url) {
  const res = await fetch(url);
  return res.ok;
}

module.exports = { greet, fetchGreeting };
