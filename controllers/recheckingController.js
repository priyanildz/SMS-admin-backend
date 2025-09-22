// recheckingController
const Rechecking = require("../models/recheckingModel");

// Add new rechecking request
exports.addRechecking = async (req, res) => {
  try {
    const recheck = new Rechecking(req.body);
    await recheck.save();
    res.status(201).json({ message: "Rechecking assigned successfully", recheck });
  } catch (error) {
    console.error("Error adding rechecking:", error);
    res.status(500).json({ error: "Failed to assign rechecking" });
  }
};

// Get all rechecking requests
exports.getRechecking = async (req, res) => {
  try {
    const rechecks = await Rechecking.find()
      .populate("assignedTo", "name") // only fetch staff name
      .populate("checkedBy", "name");
    res.status(200).json(rechecks);
  } catch (error) {
    console.error("Error fetching rechecking:", error);
    res.status(500).json({ error: "Failed to fetch rechecking" });
  }
};
