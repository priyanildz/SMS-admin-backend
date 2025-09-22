const capacity = require("../models/capacityModel");
exports.addCapacity = async (req, res) => {
  try {
    const response = new capacity(req.body);
    await response.save();
    return res.status(200).json({ message: "capacity added successfully" });
  } catch (error) {
    return res.status(200).json({ error: error.message });
  }
};

exports.getCapacity = async (req, res) => {
  try {
    const response = await capacity.find();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json({ error: error.message });
  }
};
