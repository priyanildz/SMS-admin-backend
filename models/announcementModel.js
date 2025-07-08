const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  announcementId: {
    type: String,
    required: true,
    unique: true,
  },
  priority: {
    type: Number, 
    default: 1,
  },
  title: {
    type: String,
    required: true,
  },
  visibility: {
    type: String,
    enum: ["all", "students", "teacher", "admin"],
    required: true,
  },
  department: {
    type: String,
  },
  schedule: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["draft", "sent"],
    default: "draft",
  }
}, { timestamps: true });

module.exports = mongoose.model("announcement", AnnouncementSchema);
