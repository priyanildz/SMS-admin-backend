const mongoose = require("mongoose");

const staffLeaveSchema = new mongoose.Schema({
  staffid: { type: String, required: true, ref: "staff" },
  subject: { type: String, lowercase: true },
  message: { type: String, lowercase: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], lowercase: true }
}, {
  timestamps: true
});

module.exports = mongoose.model("staff_leave", staffLeaveSchema);