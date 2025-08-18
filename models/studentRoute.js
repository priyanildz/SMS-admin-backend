 const StudentRouteSchema = new mongoose.Schema(
  {
    vid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vehicle",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
    routeNo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "route",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("studentroute", StudentRouteSchema);
