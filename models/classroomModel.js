const mongoose = require("mongoose");
const Classroom = mongoose.Schema({
  standard: {
    type: String,
    required: true,
  },
  division: {
    required: true,
    type: String,
  },
  staffid: {
    ref: "staff",
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    Uunique: true,
  },
  studentcount: {
    required: true,
    type: Number,
  },
  student_ids: {
    type: Object,
    required: true,
  },
});
// Ensure a teacher cannot be assigned to more than one standard/division combination
Classroom.index({ staffid: 1 }, { unique: true });
module.exports = mongoose.model("classroom",Classroom)