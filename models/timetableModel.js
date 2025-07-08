const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
  tid: {
    type: String,
    required: true,
    unique: true,
  },
  submittedby: {
    fullname: { type: String },
    designation: { type: String },
    adminid: { type: mongoose.Schema.Types.ObjectId, ref: "staff" },
  },
  standard: {
    type: String,
    required: true,
  },
  division: {
    type: String,
  },
  classteacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "staff",
  },
  year: {
    type: Number,
    default: new Date().getFullYear(),
  },
  from: {
    type: String,
  },
  to: {
    type: String,
  },
  timetable: {
    type: Object,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("timetable", timetableSchema);