const mongoose = require("mongoose")
const DriverSchema = new mongoose.Schema({
  vid: {
    type: String,
    required: true,
  },
  driverName: {
    type: String,
    required: true,
  },
  supervisorName: String
}, { timestamps: true });

module.exports = mongoose.model("driver", DriverSchema);