const mongoose = require("mongoose");
const report = new mongoose.Schema(
  {
    rollno: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String },
    marksheet: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model("report", report);