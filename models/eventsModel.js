const EventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "staff",
    required: true,
  },
  standard: String,
  division: String,
  participants: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "student" }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("event", EventSchema);