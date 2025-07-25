const examModel = require("../models/examModel");
exports.addETimetable = async (req, res) => {
  try {
    const response = new examModel(req.body);
    await response.save();
    return res
      .status(200)
      .json({ message: "exam timetable created successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.getETimetable = async (req, res) => {
  try {
    const response = await examModel.find();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};