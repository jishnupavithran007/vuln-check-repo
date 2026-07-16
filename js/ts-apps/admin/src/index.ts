import { titleCase } from '@sandbox/js-util';
// escape-string-regexp is CJS in v4 but ESM-only in v5 — a major upgrade breaks the build/tests.
import escapeStringRegexp from 'escape-string-regexp';

export function pageTitle(s: string): string {
  return titleCase(s) + ' | Admin';
}

export function titleMatcher(s: string): RegExp {
  return new RegExp(escapeStringRegexp(pageTitle(s)));
}
