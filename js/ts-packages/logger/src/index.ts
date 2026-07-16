// chalk is CJS in v4 but ESM-only in v5 — a major upgrade breaks the build/tests.
import chalk from 'chalk';

export function info(msg: string): string {
  return chalk.green('[info] ' + msg);
}
