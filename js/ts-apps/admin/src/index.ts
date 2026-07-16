import { titleCase } from '@sandbox/js-util';

// escape-string-regexp 5.0.0 is ESM-only, so it can no longer be required from
// this CommonJS (ts-jest) codebase. Inline the same escaping logic instead of
// importing the package, matching the upstream implementation exactly:
// https://github.com/sindresorhus/escape-string-regexp/blob/main/index.js
function escapeStringRegexp(string: string): string {
  return string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
}

export function pageTitle(s: string): string {
  return titleCase(s) + ' | Admin';
}

export function titleMatcher(s: string): RegExp {
  return new RegExp(escapeStringRegexp(pageTitle(s)));
}
