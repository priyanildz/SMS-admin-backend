const mongoose = require("mongoose");

const TimetableSchema = new mongoose.Schema({
  standard: {
    type: String,
    required: true,
  },
  from: {
    type: String, 
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  timetable: {
    type: Object, 
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("timetable", TimetableSchema);
