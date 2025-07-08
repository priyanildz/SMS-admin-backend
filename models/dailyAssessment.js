const mongoose = require("mongoose");

const DailyAssessmentSchema = new mongoose.Schema({
  assessmentid: {
    type: String,
    required: true,
    unique: true,
  },
  standard: {
    type: String,
    required: true,
  },
  division: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  classteacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "staff", 
    required: true,
  },
  subjectcovered: {
    type: String,
    required: true,
  },
  topiccovered: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
  },
  classactivity: {
    type: String,
  },
  homeworkdescription: {
    type: String,
  },
  submissiondeadline: {
    type: Date,
  }
}, { timestamps: true });

module.exports = mongoose.model("dailyassessment", DailyAssessmentSchema);