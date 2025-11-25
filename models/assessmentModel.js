// this is assessment for classroom management
const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    standard: { type: String },
    division: { type: String },
    teacherName: {
      type: String,
      required: true,
      trim: true,
    },
    subjectCovered: {
      type: String,
      trim: true,
    },
    topicCovered: {
      type: String,
      trim: true,
    },
    keyPoints: {
      type: String,
    },
    classActivity: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("assessment", assessmentSchema);
