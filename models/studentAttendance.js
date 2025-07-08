const StudentAttendanceSchema = new mongoose.Schema({
  standard: {
    type: String,
    required: true,
  },
  division: {
    type: String,
    required: true,
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "staff",
  },
  studentData: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "student" },
      name: String,
      remark: String,
    }
  ],
  presentCount: {
    type: Number,
    default: 0,
  },
  totalCount: {
    type: Number,
    default: 0,
  },
  month: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("studentattendance", StudentAttendanceSchema);
