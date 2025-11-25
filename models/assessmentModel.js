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




// assessmentModel.js - CREATE THIS FILE

const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema({
    // Link to Staff (Teacher)
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "staff", // References the 'staff' model
        required: true,
    },
    // Link to Classroom (Provides Standard, Division, and Student Context)
    classroomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "classroom", // References the 'classroom' model
        required: true,
    },
    // Assessment content details
    date: {
        type: Date,
        required: true,
    },
    subjectCovered: {
        type: String, // Storing subject name as a string for simplicity, or use subjectId ref
        required: true,
    },
    topicCovered: {
        type: String,
        required: true,
    },
    keyPoints: {
        type: String,
    },
    classActivity: {
        type: String,
    },
    // Homework details (combined into one assessment record)
    homeworkDescription: {
        type: String,
    },
    submissionDeadline: {
        type: Date,
    },
}, { timestamps: true });

module.exports = mongoose.model("assessment", assessmentSchema);