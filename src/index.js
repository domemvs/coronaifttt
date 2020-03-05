/* eslint-disable consistent-return */
require('dotenv').config();
const schedule = require('node-schedule');
const { log, sleep } = require('./helper');
// const { getDataFromDisk, writeDataToDisk } = require('./cache');
const { getAllInfections } = require('./infections');
const {
  sendNotification,
  getCountriesThatNeedNotification,
  getDataToSend,
} = require('./notification');
const {
  db, getCachedInfections, saveInfections,
} = require('./db');

const COUNTRIES = ['Germany', 'Italy', 'France'];

const runJob = async () => {
  try {
    const cachedData = await getCachedInfections();
    const newData = await getAllInfections(COUNTRIES);
    const hasNewData = cachedData.some(
      (cachedCountry) => cachedCountry.infections !== newData[cachedCountry.country].infections
       || cachedCountry.deaths !== newData[cachedCountry.country].deaths,
    );

    if (!hasNewData) {
      log('no new data found');
      return false;
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
    await saveInfections(newData);
    log(`Sent ${notificationPromises.length} notifications to IFTTT!`);
  } catch (error) {
    log(error);
  }
};

const start = () => {
  schedule.scheduleJob('0,30 * * * *', async () => {
    log('starting job');
    await runJob();
    log('finished job');
  });
};


db.once('open', async () => {
  log('DB connected');
  start();
  if (process.env.RUN_NOW === 'yes') {
    (async () => {
      log('manual run');
      await runJob();
      log('manual run finished');
    })();
  }
});
