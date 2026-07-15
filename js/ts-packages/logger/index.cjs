// Uses chalk@4 (CommonJS). Upgrading to chalk@5 (ESM-only) breaks this
// require() call — exactly the kind of breaking change Stage 3 repairs.
const chalk = require('chalk');

function info(msg) {
  return chalk.green('[info] ' + msg);
}

module.exports = { info };
