const InstallmentSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
  },
  type: {
    type: String, 
    required: true,
  },
  feeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "fee",
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("installment", InstallmentSchema);