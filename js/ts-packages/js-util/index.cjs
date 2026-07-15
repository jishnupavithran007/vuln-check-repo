const _ = require('lodash');

function titleCase(s) {
  return _.startCase(_.toLower(s));
}

module.exports = { titleCase };
