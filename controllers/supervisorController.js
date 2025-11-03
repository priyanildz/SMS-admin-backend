const supervisor = require("../models/supervisorModel");
exports.addSupervisor = async (req, res) => {
  try {
    const response = new supervisor(req.body);
    await response.save();
    return res.status(200).json({ message: "added exam supervisor" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getSupervisor = async (req, res) => {
  try {
    const response = await supervisor.find();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
