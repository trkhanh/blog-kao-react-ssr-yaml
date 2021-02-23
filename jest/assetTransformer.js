// Ref: https://github.com/facebook/jest/issues/2663
const path = require("path");

module.exports = {
  process(_, filename) {
    const content = JSON.stringify(path.basename(filename));
    return `module.exports = ${content};`;
  },
};
