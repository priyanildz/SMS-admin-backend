const mongoose = require("mongoose");

const AssignRoleSchema = new mongoose.Schema({
  role_id: {
    type: String,
    required: true,
    unique: true,
  },
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
  },
  priority: {
    type: Number, 
    default: 1,
  }
}, { timestamps: true });

module.exports = mongoose.model("role", AssignRoleSchema);