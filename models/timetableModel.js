// const mongoose = require("mongoose");

// const timetableSchema = new mongoose.Schema(
//   {
//     tid: {
//       type: String,
//       unique: true,
//       default: () => `TT-${Date.now()}`,
//     },
//     submittedby: {
//       type: String,
//       required: true,
//     },
//     standard: {
//       type: String,
//       required: true,
//       enum: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], // adjust
//     },
//     division: {
//       type: String,
//       required: true,
//       enum: ["A", "B", "C"], // adjust
//     },
//     classteacher: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "staff",
//       required: true,
//     },
//     year: {
//       type: Number,
//       default: new Date().getFullYear(),
//     },
//     from: { type: String, required: true },
//     to: { type: String, required: true },
//     timetable: [
//       {
//         day: { type: String, required: true }, // Monday, Tuesday, etc.
//         periods: [
//           {
//             periodNumber: { type: Number, required: true },
//             subject: {
//               type: String,
//               required: true,
//             },
//             teacher: {
//               type: mongoose.Schema.Types.ObjectId,
//               ref: "staff",
//               default: null, // no teacher for Break
//             },
//             time: { type: String, required: true },
//           },
//         ],
//       },
//     ],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("timetable", timetableSchema);
const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    tid: {
      type: String,
      unique: true,
      default: () => `TT-${Date.now()}`,
    },
    submittedby: {
      type: String,
      required: true,
    },
    standard: {
      type: String,
      required: true,
      enum: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    },
    // Division field REMOVED: The timetable now applies to the entire standard.
    division: {
      type: String,
      required: false, // Set to false to allow saving without division
    //   default: "ALL", // Default value to distinguish standard-wide timetable if needed
      enum: ["A", "B", "C", "D", "E", "F"], // Enum removed
    },
    classteacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "staff",
      required: false, // Made optional since it's a standard-wide template
      default: null
    },
    year: {
      type: Number,
      default: new Date().getFullYear(),
    },
    from: { type: String, required: true },
    to: { type: String, required: true },
    timetable: [
      {
        day: { type: String, required: true }, // Monday, Tuesday, etc.
        periods: [
          {
            periodNumber: { type: Number, default: null }, // Null for Breaks/Lunch
            subject: {
              type: String,
              required: true,
            },
            teacher: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "staff",
              default: null, // Null for Breaks/Lunch
            },
            teacherName: { // NEW: To store the teacher's display name
              type: String,
              default: null,
            },
            time: { type: String, required: true },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("timetable", timetableSchema);