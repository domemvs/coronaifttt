const fetch = require('node-fetch');
const log = require('./log');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const NOTIFICATION_URL = `https://maker.ifttt.com/trigger/corona_de/with/key/${process.env.IFTTT_KEY}`;

const sendNotification = async (data) => {
  try {
    const response = await fetch(NOTIFICATION_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.text();
    log('notification sent with following result:', result);
    await sleep(5000);
    return true;
  } catch (error) {
    log(error);
    return null;
  }
};

const getCountriesThatNeedNotification = (cachedData, newData) => {
  const needNotification = [];
  Object.keys(cachedData).forEach((key) => {
    if (
      newData[key].infections !== cachedData[key].infections
          || newData[key].deaths !== cachedData[key].deaths
    ) {
      needNotification.push(key);
    }
  });

  return needNotification;
};

const getDataToSend = (country, newData) => ({
  value1: newData[country].country.toString(),
  value2: newData[country].infections.toString(),
  value3: newData[country].deaths.toString(),
});

module.exports = {
  sendNotification,
  getCountriesThatNeedNotification,
  getDataToSend,
};
