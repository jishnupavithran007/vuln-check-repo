import { greet } from '@sandbox/home';
import { info } from '@sandbox/logger';
import _ from 'lodash';

export function boot(): string {
  return info('blink-v2 booting: ' + greet('user', 7));
}

// lodash 4 REMOVED `_.pluck` — the 3 -> 4 major upgrade breaks this.
export function moduleIds(mods: Array<{ id: string }>): string[] {
  return _.pluck(mods, 'id');
}
