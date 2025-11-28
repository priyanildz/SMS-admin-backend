const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  standard: { type: String, required: true },
  subject: { type: String, required: true },
  set: { type: String, required: true }, // URL of the scheduled set
  schedule: { type: Date, required: true },
}, {
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model("Schedule", scheduleSchema);