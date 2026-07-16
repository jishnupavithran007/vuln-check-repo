// chalk 5 is ESM-only, which ts-jest (CommonJS) cannot statically import,
// so color codes are applied directly instead of depending on chalk at runtime.
const ANSI_GREEN = '\x1b[32m';
const ANSI_RESET = '\x1b[39m';

export function info(msg: string): string {
  return ANSI_GREEN + '[info] ' + msg + ANSI_RESET;
}
