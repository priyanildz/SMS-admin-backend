const mongoose = require("mongoose");

const staffRoleSchema = new mongoose.Schema({
  staffid: { type: String, required: true, ref: "staff" },
  position: { type: String, lowercase: true },
  dept: { type: String, lowercase: true },
  preferredgrades: { type: [String], lowercase: true },
  joiningdate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("staff_role", staffRoleSchema);
