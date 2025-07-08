const SupervisorSchema = new mongoose.Schema({
  examtype: {
    type: String,
    enum: ["semester 1", "finals"],
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