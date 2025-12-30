const mongoose = require("mongoose");

const adminLeaveSchema = mongoose.Schema({
  username: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, default: "Pending" }
});

module.exports = mongoose.model("AdminLeave", adminLeaveSchema);