// const paperEval = require("../models/paperEvaluation");
// exports.addEval = async (req, res) => {
//   try {
//     const response = new paperEval(req.body);
//     await response.save();
//     return res.status(200).json({ message: "evaluation added successfully" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// exports.getEval = async (req, res) => {
//   try {
//     const papers = await paperEval.find()
//       .populate("assignedteacher", "firstname")
//       .lean();
//     res.json({ success: true, data: papers });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };



// paperEvaluationController.js

const paperEval = require("../models/paperEvaluation");

exports.addEval = async (req, res) => {
  try {
    const response = new paperEval(req.body);
    await response.save();
    // Fix for client-side success check: ensure success: true is returned
    return res.status(200).json({ success: true, message: "evaluation added successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getEval = async (req, res) => {
  try {
    const papers = await paperEval.find()
      .populate("assignedteacher", "firstname lastname")
      .lean();
    res.json({ success: true, data: papers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// NEW: Function to delete a paper evaluation assignment
exports.deleteEval = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await paperEval.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }
    
    return res.status(200).json({ success: true, message: "Assignment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};