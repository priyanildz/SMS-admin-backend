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
module.exports = mongoose.model("classroom",Classroom)