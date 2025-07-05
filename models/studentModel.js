const mongoose = require("mongoose");
const studentSchema = new mongoose.Schema({
  studentid: {
    required: true,
    unique: true,
    type: String,
    trim: true,
  },
  firstname: {
    required: true,
    trim: true,
    type: String,
  },
  middlename: {
    trim: true,
    type: String,
  },
  lastname: {
    required: true,
    trim: true,
    type: String,
  },
  dob: {
    type: Date,
    required: true,
  },
  birthplace: {
    type: String,
    trim: true,
  },
  bloodgroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    required: true,
  },
  gender: {
    type: String,
    enum: ["Female", "Male", "Others"],
    required: true,
  },
  category: {
    type: String,
    required: true
  },
  nationality: {
    type: String,
    required: true
  },
  aadharno: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{12}$/
  },
  photo: {
    type: String,
    default: ""
  },
  status: {
    type: Boolean,
    default: true,
  },
  password: {
    type: String,
    required: true,
    default: 'student@123'
  }
}
,{
    timestamps: true
  }
);
module.exports = mongoose.model("Student", studentSchema);