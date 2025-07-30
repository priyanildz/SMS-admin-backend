const mongoose = require('mongoose');

const TermAssessmentSchema = new mongoose.Schema({
  assessmentid: {
    type: String,
    required: true
  },
  classroomid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'classroom', 
    required: true
  },
  standard: {
    type: String,
    required: true
  },
  division: {
    type: String,
    required: true
  },
  date: {
    type: Date
  },
  time: {
    type: String
  },
  totalmarks: {
    type: Number
  },
  topic: {
    type: String
  },
  subject: {
    type: String
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  lecno: {
    type: String
  },
  staffid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'staff', 
    required: true
  },
  studentsAppeared: {
    type: Number
  },
  studentData: {
    type: Object 
  },
  document: {
    type: String 
  }
});

module.exports = mongoose.model('termassessment', TermAssessmentSchema);
