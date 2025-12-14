// const mongoose = require("mongoose")
// const VehicleSchema = new mongoose.Schema({
//   vid: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   vehiclename: String,
//   capacity: String,
//   regno: Number,
//   // assignedroute: String,
//   status: {
//     type: String,
//     enum: ["active", "inactive","Active","Inactive"],
//     default: "active"
//   },
//   type: String,
//   vehicleno: {
//     type: String,
//     required: true
//   }
// }, { timestamps: true });

// module.exports = mongoose.model("vehicle", VehicleSchema);














// const mongoose = require("mongoose")
// const VehicleSchema = new mongoose.Schema({
//   vid: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   // Added 'type' for Vehicle Type (Bus, Van, Auto)
//   type: {
//     type: String,
//     required: true, // Make compulsory
//   },
//   vehiclename: {
//     type: String,
//     required: true, // Make compulsory
//   },
//   capacity: {
//     type: String,
//     required: true, // Make compulsory
//   },
//   regno: {
//     type: String, // Changed to String as it's a contact/registration number
//     required: true, // Make compulsory
//   },
//   // Removed assignedroute as it was commented out in the component
//   // assignedroute: String,
//   status: {
//     type: String,
//     enum: ["active", "inactive","Active","Inactive"],
//     default: "active",
//     required: true, // Make compulsory
//   },
//   vehicleno: {
//     type: String,
//     required: true, // Make compulsory
//   },
//   // 🚨 NEW FIELDS for Document URLs (Cloudinary response)
//   vehicleDocumentUrl: {
//     type: String,
//     required: true,
//   },
//   pucUrl: {
//     type: String,
//     required: true,
//   },
//   insuranceUrl: {
//     type: String,
//     required: true,
//   },
//   registrationCertificateUrl: {
//     type: String,
//     required: true,
//   },
// }, { timestamps: true });

// module.exports = mongoose.model("vehicle", VehicleSchema);

















// const mongoose = require("mongoose")
// const VehicleSchema = new mongoose.Schema({
//   vid: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   // Added 'type' for Vehicle Type (Bus, Van, Auto)
//   type: {
//     type: String,
//     required: true, // Make compulsory
//   },
//   vehiclename: {
//     type: String,
//     required: true, // Make compulsory
//   },
//   capacity: {
//     type: String,
//     required: true, // Make compulsory
//   },
//   regno: {
//     type: String, // Changed to String as it's a contact/registration number
//     required: true, // Make compulsory
//   },
//   // Removed assignedroute as it was commented out in the component
//   // assignedroute: String,
//   status: {
//     type: String,
//     enum: ["active", "inactive","Active","Inactive"],
//     default: "active",
//     required: true, // Make compulsory
//   },
//   vehicleno: {
//     type: String,
//     required: true, // Make compulsory
//   },
//   // 🚨 REMOVED NEW FIELDS for Document URLs (vehicleDocumentUrl, pucUrl, insuranceUrl, registrationCertificateUrl)
// }, { timestamps: true });

// module.exports = mongoose.model("vehicle", VehicleSchema);







const mongoose = require("mongoose")

const VehicleSchema = new mongoose.Schema({
  vid: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true, 
  },
  vehiclename: {
    type: String,
    required: true, 
  },
  capacity: {
    type: String,
    required: true, 
  },
  regno: {
    type: String, 
    required: true, 
  },
  status: {
    type: String,
    enum: ["active", "inactive","Active","Inactive"],
    default: "active",
    required: true, 
  },
  vehicleno: {
    type: String,
    required: true, 
  },
  // 🌟 NEW DOCUMENT FIELDS 🌟
  vehicleImageUrl: {
    type: String,
    required: true, // Must be uploaded
  },
  pucUrl: {
    type: String,
    required: true, // Must be uploaded
  },
  insuranceUrl: {
    type: String,
    required: true, // Must be uploaded
  },
  registrationCertificateUrl: {
    type: String,
    required: true, // Must be uploaded
  },
}, { timestamps: true });

module.exports = mongoose.model("vehicle", VehicleSchema);