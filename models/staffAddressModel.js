const mongoose = require("mongoose");

const staffAddressSchema = new mongoose.Schema({
  staffid: { type: String, required: true, ref: "staff" },
  // insertion 
  addressline1: { type: String, required: true, lowercase: true },
  addressline2: { type: String, lowercase: true },
  city: { type: String, required: true, lowercase: true },
  postalcode: { type: String, required: true },
  district: { type: String, lowercase: true },
  state: { type: String, required: true, lowercase: true },
  country: { type: String, required: true, lowercase: true }
});

module.exports = mongoose.model("staff_address", staffAddressSchema);