import _ from 'lodash';
// strip-ansi is CJS in v6 but ESM-only in v7 — a major upgrade breaks the build.
import stripAnsi from 'strip-ansi';
// ms only ships patch updates and never breaks — a Tier 3 (auto-merge) upgrade.
import ms from 'ms';

export function titleCase(s: string): string {
  return _.startCase(stripAnsi(s).toLowerCase());
}

export function humanize(millis: number): string {
  return ms(millis);
}

export function pluckNames(items: Array<{ name: string }>): string[] {
  return _.map(items, 'name');
}

export function hasValue<T>(list: T[], value: T): boolean {
  return _.includes(list, value);
}
