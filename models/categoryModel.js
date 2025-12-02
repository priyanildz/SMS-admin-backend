const mongoose = require("mongoose");
const category = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("category", category);