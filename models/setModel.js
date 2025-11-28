// const mongoose = require("mongoose");

// const setSchema = new mongoose.Schema({
//   standard: { type: String, required: true },
//   subject: { type: String, required: true },
//   name: { type: String, required: true }, // e.g. "Set 1"
//   url: { type: String, required: true },  // file link / PDF URL
// });

// module.exports = mongoose.model("paper-set", setSchema);



const mongoose = require("mongoose");

const setSchema = new mongoose.Schema({
  standard: { type: String, required: true },
  subject: { type: String, required: true },
  name: { type: String, required: true }, // e.g. "Set 1"
  // CHANGED: Now storing the local path or filename of the PDF
  pdfPath: { type: String, required: true }, 
});

module.exports = mongoose.model("paper-set", setSchema);