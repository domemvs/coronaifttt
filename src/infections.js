const fetch = require('node-fetch');
const cheerio = require('cheerio');

const SOURCE_URL = 'https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vR30F8lYP3jG7YOq8es0PBpJIE5yvRVZffOyaqC0GgMBN6yt0Q-NI8pxS7hd1F9dYXnowSC6zpZmW9D/pubhtml/sheet?headers=false&gid=0';

const getAllInfections = async (countries) => {
  const response = await fetch(SOURCE_URL);
  const html = await response.text();
  const $ = cheerio.load(html);
  const allData = {};

  countries.forEach((country) => {
    const dataRow = $(`table.waffle tr:contains("${country}") td`);
    const data = {
      country: dataRow[0].children[0].data,
      infections: parseInt(dataRow[1].children[0].data.replace(',', ''), 10),
      deaths: parseInt(dataRow[2].children[0].data.replace(',', ''), 10),
    };
    allData[country] = data;
  });

  return allData;
};

module.exports = {
  getAllInfections,
};
