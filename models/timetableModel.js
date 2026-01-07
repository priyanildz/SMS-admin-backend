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
//       enum: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
//     },
//     // Division field REMOVED: The timetable now applies to the entire standard.
//     division: {
//       type: String,
//       required: false, // Set to false to allow saving without division
//       default: "ALL", // Default value to distinguish standard-wide timetable if needed
//       // enum: ["A", "B", "C", "D", "E", "F"], // Enum removed
//     },
//     classteacher: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "staff",
//       required: false, // Made optional since it's a standard-wide template
//       default: null
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
//             periodNumber: { type: Number, default: null }, // Null for Breaks/Lunch
//             subject: {
//               type: String,
//               required: true,
//             },
//             teacher: {
//               type: mongoose.Schema.Types.ObjectId,
//               ref: "staff",
//               default: null, // Null for Breaks/Lunch
//             },
//             teacherName: { // NEW: To store the teacher's display name
//               type: String,
//               default: null,
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
// File: timetableModel.js

// const mongoose = require("mongoose");

// const timetableSchema = new mongoose.Schema(
//   {
//     tid: {
//       type: String,
//       unique: true,
//       default: () => `TT-${Date.now()}`,
//     },
//     submittedby: {
//       type: String,
//       required: true,
//     },
//     standard: {
//       type: String,
//       required: true,
//       enum: ["Nursery", "Junior", "Senior", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
//     },
//     division: { // Division field is REQUIRED for granular storage
//       type: String,
//       required: true, 
//       enum: ["A", "B", "C", "D", "E"], // Stays as F, though only A-E are used in the controller
//     },
//     classteacher: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "staff",
//       required: false,
//       default: null
//     },
//     year: {
//       type: Number,
//       default: new Date().getFullYear(),
//     },
//     from: { type: String, required: true },
//     to: { type: String, required: true },
//     timetable: [
//       {
//         day: { type: String, required: true },
//         periods: [
//           {
//             periodNumber: { type: Number, default: null },
//             subject: {
//               type: String,
//               required: true,
//             },
//             teacher: {
//               type: mongoose.Schema.Types.ObjectId,
//               ref: "staff",
//               default: null,
//             },
//             teacherName: { 
//               type: String,
//               default: null,
//             },
//             time: { type: String, required: true },
//           },
//         ],
//       },
//     ],
//   },
//   { timestamps: true }
// );

// // Add unique index to prevent duplicate timetables for the same standard+division+year
// timetableSchema.index({ standard: 1, division: 1, year: 1 }, { unique: true });

// module.exports = mongoose.model("timetable", timetableSchema);


const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    tid: { type: String, unique: true, default: () => `TT-${Date.now()}` },
    submittedby: { type: String, required: true },
    standard: {
      type: String,
      required: true,
      // Fixed spelling and added pre-primary options
      enum: ["Nursery", "Junior", "Senior", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    },
    division: { type: String, required: true, enum: ["A", "B", "C", "D", "E"] },
    classteacher: { type: mongoose.Schema.Types.ObjectId, ref: "staff", default: null },
    year: { type: Number, default: new Date().getFullYear() },
    from: { type: String, required: true },
    to: { type: String, required: true },
    timing: { type: String }, // Stores the timing range
    status: { type: String, enum: ['draft', 'published'], default: 'draft' }, // Added for Publish logic
    publishedAt: { type: Date }, // Added for Publish logic
    timetable: [
      {
        day: { type: String, required: true },
        periods: [
          {
            periodNumber: { type: Number, default: null },
            subject: { type: String, required: true },
            teacher: { type: mongoose.Schema.Types.ObjectId, ref: "staff", default: null },
            teacherName: { type: String, default: null },
            time: { type: String, required: true },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

timetableSchema.index({ standard: 1, division: 1, year: 1 }, { unique: true });
module.exports = mongoose.model("timetable", timetableSchema);