const mongoose = require("mongoose");

const staffEducationSchema = new mongoose.Schema({
  staffid: { type: String, required: true, ref: "staff" },
  highestqualification: { type: String, lowercase: true },
  yearofpassing: { type: String },
  specialization: { type: String, lowercase: true },
  certificates: { type: [String] },
  universityname: { type: String, lowercase: true }
});

module.exports = mongoose.model("staff_education", staffEducationSchema);