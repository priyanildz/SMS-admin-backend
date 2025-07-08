const Staff = require("../models/staffModel");
exports.getStaff = async (req, res) => {
  try {
    const staff = await Staff.find()
    return res.status(200).json(staff)
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};