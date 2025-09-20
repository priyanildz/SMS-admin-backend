const mongoose = require("mongoose");

const capacity = new mongoose.Schema({
  standard: { type: String, required: true },
  division: { type: String, required: true },
  count: { type: Number },
});

module.exports = mongoose.model("capacity", capacity);