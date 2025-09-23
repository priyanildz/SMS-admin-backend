const mongoose = require("mongoose");

const ExamTimetableSchema = new mongoose.Schema(
  {
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
    timetable: {
      type: [
        {
          subject: {
            type: String,
            required: true,
          },
          date: {
            type: Date,
            required: true,
          },
          starttime: {
            type: String,
            required: true,
          },
          endtime: {
            type: String,
            required: true,
          },
        },
      ],
      required: true,
    },
    enddate: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("exam", ExamTimetableSchema);
