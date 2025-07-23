const mongoose = require("mongoose")
const DriverSchema = new mongoose.Schema({
  vid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "vehicle",
    required: true,
  },
  driverId: {
    type: String,
    required: true,
    unique: true,
  },
  driverName: {
    type: String,
    required: true,
  },
  supervisorName: String
}, { timestamps: true });

module.exports = mongoose.model("driver", DriverSchema);