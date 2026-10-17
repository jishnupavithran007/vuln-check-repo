import { titleCase } from '@sandbox/js-util';
import { info } from '@sandbox/logger';
import isOdd from 'is-odd';

export function greet(name: string, n: number): string {
  return info(titleCase('welcome ' + name) + ' (' + (isOdd(n) ? 'odd' : 'even') + ')');
}

export async function fetchGreeting(url: string): Promise<boolean> {
  const res = await fetch(url);
  return res.ok;
}
