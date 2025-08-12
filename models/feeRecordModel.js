const FeeRecordSchema = new mongoose.Schema({
  studentid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "student",
    required: true,
  },
  mode: {
    type: String,
    enum: ["cash", "card", "online", "cheque"],
    required: true,
  },
  transactionid: {
    type: String,
  },
  datetime: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  amountreceived: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("feerecord", FeeRecordSchema);
