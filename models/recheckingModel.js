const mongoose = require("mongoose")
const RecheckingRequestSchema = new mongoose.Schema({
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "staff",
    required: true,
  },
  standard: {
    type: String,
    required: true,
  },
  division: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  numberOfPapers: {
    type: Number,
    required: true,
  },
  checkedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "staff"
  },
  assignedBy: {
    type: String,
    default:'admin'
  }
}, { timestamps: true });

module.exports = mongoose.model("rechecking", RecheckingRequestSchema);
