import _ from 'lodash';
// strip-ansi is CJS in v6 but ESM-only in v7 — a major upgrade breaks the build.
import stripAnsi from 'strip-ansi';
// ms only ships patch updates and never breaks — a Tier 3 (auto-merge) upgrade.
import ms from 'ms';

export function titleCase(s: string): string {
  return _.startCase(_.toLower(stripAnsi(s)));
}

export function humanize(millis: number): string {
  return ms(millis);
}
