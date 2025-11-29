const mongoose = require("mongoose");

const setSchema = new mongoose.Schema({
  standard: { type: String, required: true },
  subject: { type: String, required: true },
  name: { type: String, required: true }, // e.g. "Set 1"
  // ✅ FIX: Use 'pdfPath' (Capital P) to match the data structure
  pdfPath: { type: String, required: true },  // file link / PDF URL
});

module.exports = mongoose.model("paper-set", setSchema);