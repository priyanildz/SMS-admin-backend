// homework model for classroom mang
const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema({
  homeworkDescription: {
    type: String,
    required: true,
    trim: true
  },
  deadline: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model("homework", homeworkSchema);