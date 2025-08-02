const mongoose = require("mongoose");

const SubjectAllocationSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "staff",
    required: true,
  },
  subjects: {
    type: [String],
    required: true,
  },
  standards: {
    type: [String],
    required: true,
  },
  divisions: {
    type: [String],
    required: true,
  },
  weeklyLectures: {
    type: Number, 
    required: true,
  },
  teacherName :{
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("subjectallocation", SubjectAllocationSchema);
