const mongoose = require("mongoose")
const PaperEvaluationSchema = new mongoose.Schema({
  assignedteacher: {
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
  assignedby: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: "staff"
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("paperevaluation", PaperEvaluationSchema);