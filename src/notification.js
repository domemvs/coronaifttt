const fetch = require('node-fetch');
const { log } = require('./helper');

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
    return true;
  } catch (error) {
    log(error);
    return null;
  }
};

const getCountriesThatNeedNotification = (cachedData, newData) => {
  const needNotification = [];
  cachedData.forEach((cachedCountryData) => {
    if (
      newData[cachedCountryData.country].infections !== cachedCountryData.infections
          || newData[cachedCountryData.country].deaths !== cachedCountryData.deaths
    ) {
      needNotification.push(cachedCountryData.country);
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
