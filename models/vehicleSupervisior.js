// const mongoose = require("mongoose");

// const StaffSchema = new mongoose.Schema({
//   fullName: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   designation: {
//     type: String,
//     required: true,
//   },
//   contactNumber: {
//     type: String,
//     required: true,
//     match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"],
//   },
//   alternateContactNumber: {
//     type: String,
//     default: null,
//     match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"],
//   },
//   licenseNumber: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   aadhaarNumber: {
//     type: String,
//     required: true,
//     unique: true,
//     match: [/^[0-9]{12}$/, "Please enter a valid 12-digit Aadhaar number"],
//   },
//   completeAddress: {
//     type: String,
//     required: true,
//   },
//   photo: {
//     type: String,
//     default: null, // It's not required, so default to null
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model("vehicle-supervisior", StaffSchema);
















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
    
    // 🌟 NEW: Personal Details (Split) - Required by Frontend Validation 🌟
    firstName: { type: String, required: true },
    middleName: { type: String, default: "" },
    lastName: { type: String, required: true },
    dob: { type: String, required: true },
    maritalStatus: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    gender: { type: String, required: true },
    nationality: { type: String, required: true },
    category: { type: String, required: true },

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
        match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"],
    },
    alternateContactNumber: {
        type: String,
        default: null,
        match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"],
    },
    
    // 🌟 NEW: Statutory IDs and Licenses 🌟
    licenseNumber: {
        type: String,
        // Default is null, not required. Explicitly remove unique: true if it was there before.
        default: null, // Optional for Supervisors
    },
    aadhaarNumber: {
        type: String,
        required: true,
        unique: true,
        match: [/^[0-9]{12}$/, "Please enter a valid 12-digit Aadhaar number"],
    },

    // 🌟 NEW: Address Details & Status
    completeAddress: {
        type: String,
        required: true,
    },
    photoUrl: {
        type: String,
        default: null, // URL after upload
    },
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
    
    // 🌟 NEW: Document URLs (Required by frontend validation)
    aadhaarFileUrl: { type: String, required: true }, 
    resumeFileUrl: { type: String, required: true }, 

    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model("vehicle-supervisior", StaffSchema);