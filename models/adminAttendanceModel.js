const mongoose = require("mongoose");

const adminAttendanceSchema = mongoose.Schema({
  username: { type: String, required: true },
  date: { type: Date, required: true }, // Format: YYYY-MM-DD
  status: { type: String, enum: ['P', 'A', 'L'], default: 'P' }, // Present, Absent, Leave
});

module.exports = mongoose.model("AdminAttendance", adminAttendanceSchema);