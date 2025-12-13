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
















const mongoose = require("mongoose")
const VehicleSchema = new mongoose.Schema({
    vid: {
        type: String,
        required: true,
        unique: true,
    },
    vehiclename: { type: String, required: true }, // Made required
    capacity: { type: String, required: true },   // Made required
    regno: { type: Number, required: true },      // Made required
    assignedroute: { type: String, required: true }, // NEW: Added required field for route
    status: {
        type: String,
        enum: ["active", "inactive", "Active", "Inactive"],
        default: "active",
        required: true // Made required
    },
    type: String,
    vehicleno: {
        type: String,
        required: true
    },
    // 👇 NEW: Document Fields
    documents: {
        vehicle_docs: { type: String, required: true },
        puc: { type: String, required: true },
        insurance: { type: String, required: true },
        registration_cert: { type: String, required: true }
    }
    // 👆 END NEW FIELDS
}, { timestamps: true });

module.exports = mongoose.model("vehicle", VehicleSchema);