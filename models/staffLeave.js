const mongoose = require("mongoose");

const staffLeaveSchema = new mongoose.Schema({
  staffid: { type: String, required: true, ref: "staff" },
  subject: { type: String, lowercase: true },
  message: { type: String, lowercase: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    lowercase: true,
    default: "pending",
  },
  submitted_at: { type: Date, default: Date.now() },
  from: { type: Date },
  to: { type: Date },
});

module.exports = mongoose.model("staff_leave", staffLeaveSchema);