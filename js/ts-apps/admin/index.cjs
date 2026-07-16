const { titleCase } = require('@sandbox/js-util');
// escape-string-regexp is CJS in v4 but ESM-only in v5 — a major upgrade breaks require().
const escapeStringRegexp = require('escape-string-regexp');

function pageTitle(s) {
  return titleCase(s) + ' | Admin';
}

function titleMatcher(s) {
  return new RegExp(escapeStringRegexp(pageTitle(s)));
}

module.exports = { pageTitle, titleMatcher };
