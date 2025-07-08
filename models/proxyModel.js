const mongoose = require("mongoose");

const ProxySchema = new mongoose.Schema({
  standard: {
    type: String,
    required: true,
  },
  division: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  lecno: {
    type: Number,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  fromteacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "staff",
    required: true,
  },
  toteacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "staff",
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("proxy", ProxySchema);