// chalk@5 is pure ESM. Node's require(esm) interop returns the module's
// named exports plus the default export under `.default` — the chalk
// instance (with .green etc.) is no longer the top-level require() result.
const chalk = require('chalk').default;

function info(msg) {
  return chalk.green('[info] ' + msg);
}

module.exports = { info };
