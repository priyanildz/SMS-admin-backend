const FeesInfoSchema = new mongoose.Schema({
  feeid: {
    type: String,
    required: true,
    unique: true,
  },
  standard: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    enum: ["pre", "primary", "secondary"],
    required: true,
  },
  categories: {
    type: Object, 
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  monthlyfee: {
    type: Number,
  },
  quarterlyfee: {
    type: Number,
  },
  halfYearlyfee: {
    type: Number,
  },
  annualfee: {
    type: Number,
  }
}, { timestamps: true });

module.exports = mongoose.model("fee", FeesInfoSchema);
