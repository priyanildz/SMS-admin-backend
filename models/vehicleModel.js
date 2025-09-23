const mongoose = require("mongoose")
const VehicleSchema = new mongoose.Schema({
  vid: {
    type: String,
    required: true,
    unique: true,
  },
  vehiclename: String,
  capacity: String,
  regno: Number,
  // assignedroute: String,
  status: {
    type: String,
    enum: ["active", "inactive","Active","Inactive"],
    default: "active"
  },
  type: String,
  vehicleno: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("vehicle", VehicleSchema);