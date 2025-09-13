import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema({
  photo: {
    type: String, 
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  contactNo: {
    type: String,
    required: true,
    unique: true,
  },
  licenseNo: {
    type: String,
    required: true,
    unique: true,
  },
  aadhaarNo: {
    type: String,
    required: true,
    unique: true,
    minlength: 12,
    maxlength: 12,
  },
  address: {
    type: String,
    required: true,
  },
  alternateContactNo: {
    type: String,
    default: null,
  },
  designation: {
    type: String,
    enum: ["Driver", "Supervisor"],
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("transport-supervisor", StaffSchema);
