/* eslint-disable no-console */

const log = (...args) => {
  console.log.apply(null, [`[${new Date()}]`, ...args]);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  log,
  sleep,
};
