// const mongoose = require("mongoose");
// const category = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true,
//   },
// });
// module.exports = mongoose.model("category", category);




// --- Category Model ---
const category = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  // FIX: Added identifier field to manage the single document holding all categories
  identifier: {
    type: String,
    required: false,
    unique: true,
    sparse: true // Allows multiple documents without the identifier field, useful for existing data
  }
});
module.exports = mongoose.model("category", category);