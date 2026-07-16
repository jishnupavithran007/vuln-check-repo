import { greet } from '@sandbox/home';
import { info } from '@sandbox/logger';

export function boot(): string {
  return info('blink-v2 booting: ' + greet('user', 7));
}
