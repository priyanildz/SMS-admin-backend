// const mongoose = require("mongoose");
// const EventSchema = new mongoose.Schema({
//   eventname: {
//     type: String,
//     required: true,
//   },
//   date: {
//     type: Date,
//     required: true,
//   },
//   staffid: {
//     type: String,
//     ref: "staff",
//   },
//   managedby: String,
//   standard: String,
//   division: String,
//   participants: [String]
// }, { timestamps: true });

// module.exports = mongoose.model("event", EventSchema);










// models/eventsModel.js
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
  // FIX: Changed to ObjectId array referencing the student model for population
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "student" 
  }]
}, { timestamps: true });

module.exports = mongoose.model("event", EventSchema);