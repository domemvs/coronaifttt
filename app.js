/* eslint-disable no-console */
require('dotenv').config();
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const schedule = require('node-schedule');
const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const SOURCE_URL = 'https://bnonews.com/index.php/2020/02/the-latest-coronavirus-cases/';
const NOTIFICATION_URL = `https://maker.ifttt.com/trigger/corona_de/with/key/${process.env.IFTTT_KEY}`;

const getCoronaInfections = async (country) => {
  const response = await fetch(SOURCE_URL);
  const html = await response.text();
  const $ = cheerio.load(html);
  const dataRow = $(`table.wp-block-table.is-style-regular tr:contains("${country}") td`);
  const data = {
    country: dataRow[0].children[0].data,
    infections: parseInt(dataRow[1].children[0].data, 10),
    deaths: parseInt(dataRow[2].children[0].data, 10),
  };
  return data;
};

const getAllInfections = async () => {
  try {
    const germanData = await getCoronaInfections('Germany');
    const italianData = await getCoronaInfections('Italy');
    const frenchData = await getCoronaInfections('France');
    return {
      germany: germanData,
      italy: italianData,
      france: frenchData,
    };
  } catch (error) {
    console.log(error);
  }
  return null;
};

const getDataFromDisk = async () => {
  try {
    const fileContents = await readFile('./data.txt', 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.log(error);
  }
  return null;
};

const writeDataToDisk = async (data) => {
  try {
    await writeFile('./data.txt', JSON.stringify(data), 'utf8');
  } catch (error) {
    console.log(error);
  }
};

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
    console.log('notification sent with following result:', result);
    return true;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const runJob = async () => {
  try {
    const cachedData = await getDataFromDisk();
    const newData = await getAllInfections();

    if (JSON.stringify(cachedData) === JSON.stringify(newData)) {
      console.log('no new data found');
      return null;
    }

    const needNotification = [];
    Object.keys(cachedData).forEach((key) => {
      if (
        newData[key].infections !== cachedData[key].infections
        || newData[key].deaths !== cachedData[key].deaths
      ) {
        needNotification.push(key);
      }
    });

    const notificationPromises = [];

    needNotification.forEach((country) => {
      const dataToSend = {
        value1: newData[country].country.toString(),
        value2: newData[country].infections.toString(),
        value3: newData[country].deaths.toString(),
      };
      console.log(dataToSend);
      notificationPromises.push(sendNotification(dataToSend));
    });

    await Promise.all(notificationPromises);
    await writeDataToDisk(newData);
    console.log('done');
    return true;
  } catch (error) {
    console.log(error);
    return null;
  }
};

schedule.scheduleJob('0,30 * * * *', async () => {
  await runJob();
});
