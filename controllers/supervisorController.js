const supervisor = require("../models/supervisiorModel");
exports.addSupervisior = async (req, res) => {
  try {
    const response = new supervisor(req.body);
    await response.save();
    return res.status(200).json({ message: "added exam supervisior" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getSupervisior = async (req, res) => {
  try {
    const response = await supervisor.find();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
