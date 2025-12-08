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
  participants: [{ 
        type: mongoose.Schema.Types.ObjectId, // Change to ObjectId
        ref: "student" // Assume your student model is named 'student'
    }]
}, { timestamps: true });

module.exports = mongoose.model("event", EventSchema);