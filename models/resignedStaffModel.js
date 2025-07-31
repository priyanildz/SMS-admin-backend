const mongoose = require("mongoose");

const resignedStaffSchema = new mongoose.Schema({
  staffid: { type: String, required: true, ref: "staff" },
  resignationDate: { type: Date, default: Date.now },
  reason: { type: String },
});

module.exports = mongoose.model("ResignedStaff", resignedStaffSchema);