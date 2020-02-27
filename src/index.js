/* eslint-disable consistent-return,no-console */

require('dotenv').config();
const schedule = require('node-schedule');
const { log, sleep } = require('./helper');
const { getDataFromDisk, writeDataToDisk } = require('./cache');
const { getAllInfections } = require('./infections');
const {
  sendNotification,
  getCountriesThatNeedNotification,
  getDataToSend,
} = require('./notification');

const COUNTRIES = ['Germany', 'Italy', 'France'];

const runJob = async () => {
  log('running job');
  try {
    const cachedData = await getDataFromDisk('data.txt');
    const newData = await getAllInfections(COUNTRIES);

    if (JSON.stringify(cachedData) === JSON.stringify(newData)) {
      log('no new data found');
      await writeDataToDisk('data.txt', newData);
      return null;
    }

    const needNotification = getCountriesThatNeedNotification(cachedData, newData);
    const notificationPromises = [];
    let dataToSend = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const country of needNotification) {
      dataToSend = getDataToSend(country, newData);
      notificationPromises.push(sendNotification(dataToSend));
      // eslint-disable-next-line no-await-in-loop
      await sleep(5000);
    }

    await Promise.all(notificationPromises);
    await writeDataToDisk('data.txt', newData);
  } catch (error) {
    log(error);
  }
  log('job finished');
};

schedule.scheduleJob('0,30 * * * *', async () => {
  await runJob();
});

if (process.env.RUN_NOW === 'yes') {
  (async () => {
    await runJob();
  })();
}
