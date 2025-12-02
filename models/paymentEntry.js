const mongoose = require("mongoose");

const paymentEntrySchema = new mongoose.Schema({
  name: { type: String, required: true },
  std: { type: String, required: true },
  div: { type: String, required: true },
  totalFees: { type: Number },
  status: { type: String, enum: ["Paid", "Unpaid"], required: true },
  installments: [
    {
      date: { type: Date, required: true },
      amount: { type: Number, required: true },
      mode: { type: String },
    },
  ],
});

module.exports = mongoose.model("PaymentEntry", paymentEntrySchema);
