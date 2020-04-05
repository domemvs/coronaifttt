/* eslint-disable no-restricted-syntax */
const mongoose = require('mongoose');
const { log } = require('./helper');
const { Infection } = require('./infectionModel');

const db = mongoose.connection;

mongoose.connect(process.env.MONGO_CONN_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASS,
});

db.on('error', () => log('error connecting to db'));

const getCachedInfections = async (countries) => Infection.find({
  country: { $in: countries },
});

const saveInfection = (country, infections, deaths) => Infection.updateOne({ country }, {
  infections,
  deaths,
});

const saveInfections = async (newData) => {
  try {
    const newDataArray = Object.values(newData);
    const updatePromises = [];
    for (const data of newDataArray) {
      updatePromises.push(saveInfection(data.country, data.infections, data.deaths));
    }
    await Promise.all(updatePromises);
  } catch (error) {
    log(error);
  }
};


module.exports = {
  db,
  getCachedInfections,
  saveInfections,
};
