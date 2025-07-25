const mongoose = require("mongoose");

const ExamTimetableSchema = new mongoose.Schema({
  standard: {
    type: String,
    required: true,
  },
  examtype: {
    type: String,
    enum: ["mid-term", "finals", "unit test", "quarterly"],
    required: true,
  },
  startdate: {
    type: Date,
    required: true,
  },
  enddate: {
    type: Date,
    required: true,
  },
  starttime: {
    type: String, 
  },
  endtime: {
    type: String,
  },
  examgap: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("exam", ExamTimetableSchema);
