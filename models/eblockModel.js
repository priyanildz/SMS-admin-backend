const mongoose = require("mongoose");

const TimetableSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  starttime: { type: String, required: true },
  endtime: { type: String, required: true },
});

const ExamBlockSchema = new mongoose.Schema(
  {
    blockNo: { type: String, required: true },
    standard: { type: String, required: true },
    examType: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    timetable: [TimetableSchema],
    totalStudents: { type: Number, default: 0 },
    totalAvailableSupervisors: { type: Number, default: 0 },
    students: {type: Object}
  },
  { timestamps: true }
);

module.exports = mongoose.model("exam-block", ExamBlockSchema);