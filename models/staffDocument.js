const mongoose = require("mongoose");

const staffDocumentsSchema = new mongoose.Schema({
  staffid: { type: String, required: true, ref: "staff" },
  documentsurl: { type: [String] } // multiple docs
});

module.exports = mongoose.model("staff_documents", staffDocumentsSchema);
