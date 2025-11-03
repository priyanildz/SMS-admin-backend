const paperEval = require("../models/paperEvaluation");
exports.addEval = async (req, res) => {
  try {
    const response = new paperEval(req.body);
    await response.save();
    return res.status(200).json({ message: "evaluation added successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getEval = async (req, res) => {
  try {
    const papers = await paperEval.find()
      .populate("assignedteacher", "firstname")
      .lean();
    res.json({ success: true, data: papers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
