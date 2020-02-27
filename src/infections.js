const fetch = require('node-fetch');
const cheerio = require('cheerio');

const SOURCE_URL = 'https://bnonews.com/index.php/2020/02/the-latest-coronavirus-cases/';

const getAllInfections = async (countries) => {
  const response = await fetch(SOURCE_URL);
  const html = await response.text();
  const $ = cheerio.load(html);
  const allData = {};

  countries.forEach((country) => {
    const dataRow = $(`table.wp-block-table.is-style-regular tr:contains("${country}") td`);
    const data = {
      country: dataRow[0].children[0].data,
      infections: parseInt(dataRow[1].children[0].data, 10),
      deaths: parseInt(dataRow[2].children[0].data, 10),
    };
    allData[country.toLowerCase()] = data;
  });

  return allData;
};

module.exports = {
  getAllInfections,
};
