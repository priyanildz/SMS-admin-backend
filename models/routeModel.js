const RouteSchema = new mongoose.Schema({
  routeNo: {
    type: String,
    required: true,
    unique: true,
  },
  areas: {
    type: [String],
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("route", RouteSchema);