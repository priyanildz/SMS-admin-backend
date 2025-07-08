const VehicleSchema = new mongoose.Schema({
  vid: {
    type: String,
    required: true,
    unique: true,
  },
  vehicleName: String,
  capacity: Number,
  regNo: String,
  assignedRoute: String,
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  type: String,
  vehicleNo: String
}, { timestamps: true });

module.exports = mongoose.model("vehicle", VehicleSchema);