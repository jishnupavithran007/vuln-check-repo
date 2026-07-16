const _ = require('lodash');
// strip-ansi is CJS in v6 but ESM-only in v7 — a major upgrade breaks require().
const stripAnsi = require('strip-ansi');
// ms only ever ships patch updates and never breaks — a textbook Tier 3
// (low-risk, auto-merge) upgrade.
const ms = require('ms');

function titleCase(s) {
  return _.startCase(_.toLower(stripAnsi(s)));
}

function humanize(millis) {
  return ms(millis);
}

module.exports = { titleCase, humanize };
