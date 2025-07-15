const mongoose = require("mongoose");

const staffTransportSchema = new mongoose.Schema({
  staffid: { type: String, required: true, ref: "staff" },
  transportstatus: { type: String, enum: ["yes", "no"], lowercase: true },
  pickuppoint: { type: String, lowercase: true },
  droppoint: { type: String, lowercase: true },
  modetransport: { type: String, lowercase: true }
});

module.exports = mongoose.model("staff_transport", staffTransportSchema);
