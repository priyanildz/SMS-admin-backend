const mongoose = require("mongoose");

const FeesInfoSchema = new mongoose.Schema(
  {
    standard: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      enum: ["pre", "primary", "secondary"],
      required: true,
    },
    categories: [
      {
        name: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    monthlyfee: Number,
    quarterlyfee: Number,
    halfYearlyfee: Number,
    annualfee: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("fee", FeesInfoSchema);