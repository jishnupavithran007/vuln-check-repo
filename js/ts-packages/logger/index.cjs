// chalk@5 is ESM-only and cannot be require()'d from this CommonJS module,
// nor loaded synchronously (dynamic import() is async and would break the
// synchronous info() contract that consumers/tests rely on). We emit the same
// ANSI green sequence chalk.green produces: ESC[32m … ESC[39m.
const GREEN_OPEN = '[32m';
const GREEN_CLOSE = '[39m';

function green(text) {
  return GREEN_OPEN + text + GREEN_CLOSE;
}

function info(msg) {
  return green('[info] ' + msg);
}

module.exports = { info };
