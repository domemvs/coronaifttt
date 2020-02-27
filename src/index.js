/* eslint-disable consistent-return,no-console */

require('dotenv').config();
const schedule = require('node-schedule');
const log = require('./log');
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
    needNotification.forEach((country) => {
      const dataToSend = getDataToSend(country, newData);
      notificationPromises.push(sendNotification(dataToSend));
    });

    await Promise.all(notificationPromises);
    await writeDataToDisk('data.txt', newData);
  } catch (error) {
    log(error);
    return null;
  }
};

schedule.scheduleJob('0,30 * * * *', async () => {
  await runJob();
});

if (process.env.RUN_NOW === 'yes') {
  (async () => {
    await runJob();
  })();
}
