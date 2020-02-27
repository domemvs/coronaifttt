const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { log } = require('./helper');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const getDataFromDisk = async (fileName) => {
  try {
    const fileContents = await readFile(path.join(__dirname, '..', fileName), 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    log(error);
    return null;
  }
};

const writeDataToDisk = async (fileName, data) => {
  try {
    await writeFile(path.join(__dirname, '..', fileName), JSON.stringify(data), 'utf8');
  } catch (error) {
    log(error);
  }
};

module.exports = {
  getDataFromDisk,
  writeDataToDisk,
};
