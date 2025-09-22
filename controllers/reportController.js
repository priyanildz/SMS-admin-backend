const report = require("../models/reportModel");
exports.addReport = async (req, res) => {
  try {
    const response = new report(req.body);
    await response.save();
    return res.status(200).json({ message: "added report card" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.getReport = async (req, res) => {
  try {
    const response = await report.find();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
