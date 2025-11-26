// examResult.js - NEW FILE CONTENT

const mongoose = require("mongoose");

const examResultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student", // Links to the student's name/details
      required: true,
    },
    // Filters used by the frontend
    standard: {
      type: String,
      required: true,
    },
    division: {
      type: String,
      required: true,
    },
    semester: {
      type: String, // You can use this for Semester 1 or 2
      required: true,
    },
    
    // --- SCORE FIELDS (Required by the frontend table logic) ---
    Maths: { type: Number, default: 0 },
    Science: { type: Number, default: 0 },
    English: { type: Number, default: 0 },
    // Add other subjects as needed (e.g., History, Hindi, etc.)
    // -----------------------------------------------------------
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExamResult", examResultSchema);