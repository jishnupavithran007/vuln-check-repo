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

// lodash 4 REMOVED `_.pluck` (use `_.map`) and `_.contains` (use `_.includes`).
// Pinned to lodash 3 here, so the 3 -> 4 major upgrade breaks these two
// functions with "TypeError: _.pluck is not a function" until they're migrated.
export function pluckNames(items: Array<{ name: string }>): string[] {
  return _.pluck(items, 'name');
}

export function hasValue<T>(list: T[], value: T): boolean {
  return _.contains(list, value);
}
