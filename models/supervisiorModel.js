const SupervisorSchema = new mongoose.Schema({
  examtype: {
    type: String,
    enum: ["mid-term", "finals", "unit test", "quarterly"],
    required: true,
  },
  examdate: {
    type: Date,
    required: true,
  },
  timeslot: {
    type: String, 
    required: true,
  },
  totalavailable: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("supervisor", SupervisorSchema);