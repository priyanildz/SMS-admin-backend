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
  // We keep staffid field for proper relational link (optional reference)
  staffid: {
    type: String, 
    ref: "staff", // Assuming staff model is named 'staff'
  },
  // We keep managedby string field because the frontend saves the name here
  managedby: String, 
  standard: String,
  division: String,
  // 💡 FIX 1: Change to ObjectId array referencing the student model for population
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "student" // Replace with your actual Student Model name if different
  }]
}, { timestamps: true });

module.exports = mongoose.model("event", EventSchema);