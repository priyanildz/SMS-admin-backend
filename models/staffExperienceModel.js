const mongoose = require("mongoose");

const staffExperienceSchema = new mongoose.Schema({
  staffid: { type: String, required: true, ref: "staff" },
  totalexperience: { type: String },
  designation: { type: String, lowercase: true },
  previousemployer: { type: String, lowercase: true },
  subjectstaught: { type: [String], lowercase: true },
  reasonforleaving: { type: String, lowercase: true }
});

module.exports = mongoose.model("staff_experience", staffExperienceSchema);
