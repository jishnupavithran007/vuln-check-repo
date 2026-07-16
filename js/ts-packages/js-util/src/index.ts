import _ from 'lodash';
// ms only ships patch updates and never breaks — a Tier 3 (auto-merge) upgrade.
import ms from 'ms';

// strip-ansi is ESM-only from v7 onward, which breaks under this package's
// CommonJS build/test setup. Inlined here (same pattern strip-ansi/ansi-regex
// use internally) so we don't depend on an ESM-only package from CJS.
const ANSI_PATTERN = [
  '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[a-zA-Z\\d]*)*)?\\u0007)',
  '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))',
].join('|');
const ansiRegex = new RegExp(ANSI_PATTERN, 'g');

function stripAnsi(s: string): string {
  return s.replace(ansiRegex, '');
}

export function titleCase(s: string): string {
  return _.startCase(_.toLower(stripAnsi(s)));
}

export function humanize(millis: number): string {
  return ms(millis);
}
