const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  user: {
    username: { type: String, required: true },
    role: { type: String, default: "admin" } 
  },
  action: { type: String, required: true }, // e.g., "ADD_ANNOUNCEMENT"
  method: { type: String, required: true }, // POST, PUT, DELETE
  endpoint: { type: String, required: true },
  payload: { type: Object }, // The data sent in the request (req.body)
  timestamp: { type: Date, default: Date.now },
  ip: String
});

module.exports = mongoose.model("AuditLog", auditLogSchema);