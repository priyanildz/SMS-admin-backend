const mongoose = require("mongoose");

const AssignRoleSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "staff", 
    required: true,
  },
  staffdept: {
    type: String,
    required: true,
  },
  roleassigned: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("role", AssignRoleSchema);