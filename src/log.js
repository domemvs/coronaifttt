/* eslint-disable no-console */
module.exports = (...args) => {
  console.log.apply(null, [`[${new Date()}]`, ...args]);
};
