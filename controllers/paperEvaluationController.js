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
const mongoose = require("mongoose");

// exports.addEval = async (req, res) => {
//   try {
//     const response = new paperEval(req.body);
//     await response.save();
//     // Fix for client-side success check: ensure success: true is returned
//     return res.status(200).json({ success: true, message: "evaluation added successfully" });
//   } catch (error) {
//     return res.status(500).json({ success: false, error: error.message });
//   }
// };

exports.addEval = async (req, res) => {
  try {
    // req.body now contains 'examtype' from the frontend
    const response = new paperEval(req.body); 
    await response.save();
    return res.status(200).json({ success: true, message: "evaluation added successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// exports.getEval = async (req, res) => {
//   try {
//     const papers = await paperEval.find()
//       .populate("assignedteacher", "firstname lastname")
//       .lean();
//     res.json({ success: true, data: papers });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

exports.getEval = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const papers = await paperEval.find()
      .populate("assignedteacher", "firstname lastname")
      .lean();

    // ✅ Perform a check for each paper to see if marks exist in examresults
    const papersWithStatus = await Promise.all(papers.map(async (paper) => {
      const resultFound = await db.collection('examresults').findOne({
        standard: paper.standard,
        division: paper.division,
        subject: paper.subject,
        semester: paper.examtype // This matches the 'semester' field where teacher saves marks
      });

      return {
        ...paper,
        status: resultFound ? "Completed" : "Pending"
      };
    }));

    res.json({ success: true, data: papersWithStatus });
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