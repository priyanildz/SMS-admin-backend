const mongoose = require("mongoose");

const StaffSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  designation: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"],
  },
  alternateContactNumber: {
    type: String,
    default: null,
    match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"],
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
  },
  aadhaarNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^[0-9]{12}$/, "Please enter a valid 12-digit Aadhaar number"],
  },
  completeAddress: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("vehicle-supervisior", StaffSchema);
