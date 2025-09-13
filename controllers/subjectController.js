const subjectAllocation = require("../models/subjectAllocation");
exports.addSubjectAllot = async (req, res) => {
  try {
    const response = new subjectAllocation(req.body);
    await response.save();
    return res
      .status(200)
      .json({ message: "subject allotment done successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.getAllocations = async (req, res) => {
  try {
    const response = await subjectAllocation.find();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
