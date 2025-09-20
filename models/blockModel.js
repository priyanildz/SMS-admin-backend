const mongoose = require("mongoose");

const blockAllocationSchema = new mongoose.Schema(
  {
    standard: {
      type: String,
      required: true,
      trim: true,
    },
    division: {
      type: String,
      required: true,
      trim: true,
    },
    blockNo: {
      type: String,
      required: true,
      trim: true,
    },
    timing: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    studentsAllocated: {
      type: Number,
      default: 0,
      min: 0,
    },
    teacherAssigned: {
      type: String,
      required: true,
      trim: true,
    },
    academicYear: {
      type: String,
      default: "2024-2025",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model("academic-block", blockAllocationSchema);