const mongoose = require("mongoose");

const RouteSchema = new mongoose.Schema({
  routeName: {
    type: String,
    required: true,
    unique: true, // optional, if each route name must be unique
    trim: true
  },
  from: {
    type: String,
    required: true,
    trim: true
  },
  to: {
    type: String,
    required: true,
    trim: true
  },
  vehicleNumber: {
    type: String,
    required: true,
    trim: true,
    match: /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/ // "MH12AB1234"
  }
}, { timestamps: true });

module.exports = mongoose.model("route", RouteSchema);
