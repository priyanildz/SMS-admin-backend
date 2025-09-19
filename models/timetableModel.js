const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    tid: {
      type: String,
      unique: true,
      default: () => `TT-${Date.now()}`,
    },
    submittedby: {
      type: String,
      required: true,
    },
    standard: {
      type: String,
      required: true,
      enum: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], // adjust
    },
    division: {
      type: String,
      required: true,
      enum: ["A", "B", "C"], // adjust
    },
    classteacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "staff",
      required: true,
    },
    year: {
      type: Number,
      default: new Date().getFullYear(),
    },
    from: { type: String, required: true },
    to: { type: String, required: true },
    timetable: [
      {
        day: { type: String, required: true }, // Monday, Tuesday, etc.
        periods: [
          {
            periodNumber: { type: Number, required: true },
            subject: {
              type: String,
              required: true,
            },
            teacher: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "staff",
              default: null, // no teacher for Break
            },
            time: { type: String, required: true },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("timetable", timetableSchema);