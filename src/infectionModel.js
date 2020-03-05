const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  country: String,
  infections: Number,
  deaths: Number,
}, {
  timestamps: true,
});

const Infection = mongoose.model('Infection', schema);

module.exports = {
  Infection,
};
