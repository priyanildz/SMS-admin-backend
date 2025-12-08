const mongoose = require("mongoose");
const EventSchema = new mongoose.Schema({
  eventname: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  staffid: {
    type: String,
    ref: "staff",
  },
  managedby: String,
  standard: String,
  division: String,
  participants: [String]
}, { timestamps: true });

module.exports = mongoose.model("event", EventSchema);