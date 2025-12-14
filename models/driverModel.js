// const mongoose = require("mongoose")
// const DriverSchema = new mongoose.Schema({
//   vid: {
//     type: String,
//     required: true,
//   },
//   driverName: {
//     type: String,
//     required: true,
//   },
//   supervisorName: String
// }, { timestamps: true });

// module.exports = mongoose.model("driver", DriverSchema);







// const mongoose = require("mongoose")
// const DriverSchema = new mongoose.Schema({
//   // Keeping original fields, assuming 'vid' is vehicle ID
//   vid: {
//     type: String,
//     required: true,
//   },
//   // driverName (will store the combined fullName from the form)
//   driverName: { 
//     type: String,
//     required: true,
//   },
//   supervisorName: String, // Kept optional
  
//   // 🌟 NEW FIELDS from the Registration Form:

//   // Personal Details
//   firstName: { type: String, required: true },
//   middleName: { type: String, default: "" },
//   lastName: { type: String, required: true },
//   dob: { type: Date, required: true },
//   maritalStatus: { type: String, required: true },
//   bloodGroup: { type: String, required: true },
//   gender: { type: String, required: true },
//   nationality: { type: String, required: true },
//   category: { type: String, required: true },
//   aadhaarNumber: { 
//     type: String, 
//     required: true,
//     unique: true,
//     match: [/^[0-9]{12}$/, "Please enter a valid 12-digit Aadhaar number"],
//   },
//   licenseNumber: { 
//     type: String, 
//     required: true,
//     unique: true, // Must be unique for a driver
//   },
  
//   // Contact Details
//   email: { 
//     type: String, 
//     required: true,
//     unique: true,
//     match: [/.+@.+\..+/, 'Please fill a valid email address'],
//   },
//   contactNumber: { 
//     type: String, 
//     required: true,
//     match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"],
//   },
//   alternateContactNumber: { type: String, match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"] },

//   // Address Details (Storing the combined address string)
//   completeAddress: { type: String, required: true },

//   // Bank & Salary Details
//   bankName: { type: String, required: true },
//   branchName: { type: String, required: true },
//   accountNumber: { type: String, required: true, unique: true },
//   ifscCode: { type: String, required: true },
//   panNumber: { type: String, required: true, unique: true },

// }, { timestamps: true });

// module.exports = mongoose.model("driver", DriverSchema);













const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema({
  // Keeping original fields, assuming 'vid' is vehicle ID
  vid: {
    type: String,
    required: true,
  },
  driverName: { // Stored as combined full name
    type: String,
    required: true,
  },
  // supervisorName: { type: String, optional: true }, // Removed as it's not in the current form structure
  
  // 🌟 NEW: Personal Details (Split) 🌟
  firstName: { type: String, required: true },
  middleName: { type: String, default: "" },
  lastName: { type: String, required: true },
  dob: { type: String, required: true }, // Storing as String from date picker
  maritalStatus: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  gender: { type: String, required: true },
  nationality: { type: String, required: true },
  category: { type: String, required: true },
  
  // 🌟 NEW: Statutory IDs and Licenses 🌟
  aadhaarNumber: { 
    type: String, 
    required: true,
    unique: true,
    match: [/^[0-9]{12}$/, "Please enter a valid 12-digit Aadhaar number"],
  },
  licenseNumber: { 
    type: String, 
    required: true,
    unique: true, // Must be unique for a driver
  },
  
  // 🌟 NEW: Contact Details
  email: { 
    type: String, 
    required: true,
    unique: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address'],
  },
  contactNumber: { 
    type: String, 
    required: true,
    match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"],
  },
  alternateContactNumber: { type: String, match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"] },

  // 🌟 NEW: Address Details & Status
  completeAddress: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Resigned'], default: 'Active' },
  
  // 🌟 NEW: Experience Details
  totalExperience: { type: String, required: true },
  previousEmployer: { type: String, required: true },

  // 🌟 NEW: Bank & Salary Details
  bankName: { type: String, required: true },
  branchName: { type: String, required: true },
  accountNumber: { type: String, required: true, unique: true },
  ifscCode: { type: String, required: true },
  panNumber: { type: String, required: true, unique: true },

  // 🌟 NEW: Document URLs
  photoUrl: { type: String, default: null },
  aadhaarFileUrl: { type: String, required: true }, // URL after upload
  resumeFileUrl: { type: String, required: true }, // URL after upload

}, { timestamps: true });

module.exports = mongoose.model("driver", DriverSchema);