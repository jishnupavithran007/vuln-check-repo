const { greet } = require('@sandbox/home');
const { info } = require('@sandbox/logger');

function boot() {
  return info('blink-v2 booting: ' + greet('user', 7));
}

module.exports = { boot };
