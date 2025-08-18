const mongoose = require("mongoose");

const studentAssign = new mongoose.Schema({
  standard: String,
  division: String,
  routeName: String,
  pickupPoint: String,
  students: [String],
});

module.exports = mongoose.model('studentTransport', studentAssign)