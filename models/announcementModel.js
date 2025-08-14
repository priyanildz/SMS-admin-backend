const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  announcementId: {
    type: String,
    required: true,
  },
  priority: {
    type: String, 
    default: "1",
  },
  title: {
    type: String,
    required: true,
  },
  visibility: {
    type: String,
    enum: ["all", "students", "staff", "admin"],
    required: true,
  },
  department: {
    type: String,
  },
  schedule: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["draft", "sent"],
    default: "draft",
  },
  description:{
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("announcement", AnnouncementSchema);
