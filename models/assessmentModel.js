// // this is assessment for classroom management
// const mongoose = require("mongoose");

// const assessmentSchema = new mongoose.Schema(
//   {
//     date: {
//       type: Date,
//       required: true,
//     },
//     standard: { type: String },
//     division: { type: String },
//     teacherName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     subjectCovered: {
//       type: String,
//       trim: true,
//     },
//     topicCovered: {
//       type: String,
//       trim: true,
//     },
//     keyPoints: {
//       type: String,
//     },
//     classActivity: {
//       type: String,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("assessment", assessmentSchema);



// assessmentModel.js (CORRECTED)

const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    // --- REAL RELATIONSHIP FIELDS (REQUIRED FOR POPULATE) ---
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "staff", // Reference to the staff model
      required: true,
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "classroom", // Reference to the classroom model
      required: true,
    },
    homeworkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "homework", // Reference to the homework model
      required: true,
    },

    // --- ASSESSMENT DETAILS (The data you posted in MongoDB Compass) ---
    date: {
      type: Date,
      required: true,
    },
    subjectCovered: {
      type: String,
      required: true,
      trim: true,
    },
    topicCovered: {
      type: String,
      required: true,
      trim: true,
    },
    keyPoints: {
      type: String,
    },
    classActivity: {
      type: String,
    },

    // NOTE: standard, division, teacherName are NOT needed here if you use references
    // If you must keep them for compatibility, they should be optional.
  },
  { timestamps: true }
);

module.exports = mongoose.model("assessment", assessmentSchema);