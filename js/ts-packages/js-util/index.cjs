const _ = require('lodash');
// strip-ansi is CJS in v6 but ESM-only in v7 — a major upgrade breaks require().
const stripAnsi = require('strip-ansi');

function titleCase(s) {
  return _.startCase(_.toLower(stripAnsi(s)));
}

module.exports = { titleCase };
