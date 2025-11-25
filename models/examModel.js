// const mongoose = require("mongoose");

// const ExamTimetableSchema = new mongoose.Schema(
//   {
//     standard: {
//       type: String,
//       required: true,
//     },
//     examtype: {
//       type: String,
//       enum: ["mid-term", "finals", "unit test", "quarterly"],
//       required: true,
//     },
//     startdate: {
//       type: Date,
//       required: true,
//     },
//     timetable: {
//       type: [
//         {
//           subject: {
//             type: String,
//             required: true,
//           },
//           date: {
//             type: Date,
//             required: true,
//           },
//           starttime: {
//             type: String,
//             required: true,
//           },
//           endtime: {
//             type: String,
//             required: true,
//           },
//         },
//       ],
//       required: true,
//     },
//     enddate: {
//       type: String,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("exam", ExamTimetableSchema);



const mongoose = require("mongoose");

const examResultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student", // References the student model
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
    semester: {
      type: String, // Matches the 'semester' filter from the frontend
      required: true,
    },
    // Dynamically store subject scores here
    Maths: { type: Number, default: 0 },
    Science: { type: Number, default: 0 },
    English: { type: Number, default: 0 },
    // You can add more subjects dynamically as needed
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExamResult", examResultSchema);