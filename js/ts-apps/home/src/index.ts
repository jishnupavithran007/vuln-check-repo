import { titleCase } from '@sandbox/js-util';
import { info } from '@sandbox/logger';
import isOdd from 'is-odd';
// node-fetch is CJS in v2 but ESM-only in v3 — a major upgrade breaks the build/tests.
import fetch from 'node-fetch';

export function greet(name: string, n: number): string {
  return info(titleCase('welcome ' + name) + ' (' + (isOdd(n) ? 'odd' : 'even') + ')');
}

export async function fetchGreeting(url: string): Promise<boolean> {
  const res = await fetch(url);
  return res.ok;
}
