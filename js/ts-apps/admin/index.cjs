const { titleCase } = require('@sandbox/js-util');

function pageTitle(s) {
  return titleCase(s) + ' | Admin';
}

module.exports = { pageTitle };
