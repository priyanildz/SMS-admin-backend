// // recheckingController
// const Rechecking = require("../models/recheckingModel");

// // Add new rechecking request
// exports.addRechecking = async (req, res) => {
//   try {
//     const recheck = new Rechecking(req.body);
//     await recheck.save();
//     res.status(201).json({ message: "Rechecking assigned successfully", recheck });
//   } catch (error) {
//     console.error("Error adding rechecking:", error);
//     res.status(500).json({ error: "Failed to assign rechecking" });
//   }
// };

// // Get all rechecking requests
// exports.getRechecking = async (req, res) => {
//   try {
//     const rechecks = await Rechecking.find()
//       .populate("assignedTo", "name") // only fetch staff name
//       .populate("checkedBy", "name");
//     res.status(200).json(rechecks);
//   } catch (error) {
//     console.error("Error fetching rechecking:", error);
//     res.status(500).json({ error: "Failed to fetch rechecking" });
//   }
// };


// recheckingController
const Rechecking = require("../models/recheckingModel");

// Add new rechecking request
// exports.addRechecking = async (req, res) => {
//   try {
//     const recheck = new Rechecking(req.body);
//     await recheck.save();
//     res.status(201).json({ message: "Rechecking assigned successfully", recheck });
//   } catch (error) {
//     console.error("Error adding rechecking:", error);
//     res.status(500).json({ error: "Failed to assign rechecking" });
//   }
// };


exports.addRechecking = async (req, res) => {
  try {
    const { standard, division, subject } = req.body;

    // Automatically find who was originally assigned to evaluate these papers
    const originalEval = await PaperEvaluation.findOne({
      standard,
      division,
      subject
    });

    const recheckData = {
      ...req.body,
      // If an original evaluator is found, set them as checkedBy
      checkedBy: originalEval ? originalEval.assignedteacher : null
    };

    const recheck = new Rechecking(recheckData);
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
      // Ensure assignedTo and checkedBy populate the required fields for full name display
      .populate("assignedTo", "firstname lastname") 
      .populate("checkedBy", "firstname lastname");
    
    // The response is the array of rechecks, which the frontend expects
    res.status(200).json(rechecks);
  } catch (error) {
    console.error("Error fetching rechecking:", error);
    res.status(500).json({ error: "Failed to fetch rechecking" });
  }
};
// Delete a rechecking entry
exports.deleteRechecking = async (req, res) => {
  try {
    const deleted = await Rechecking.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Rechecking entry not found" });
    }

    res.status(200).json({ message: "Rechecking deleted successfully" });
  } catch (error) {
    console.error("Error deleting rechecking:", error);
    res.status(500).json({ error: "Failed to delete rechecking" });
  }
};
