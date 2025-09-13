const roleModel = require("../models/roleModel");
exports.assignRole = async (req, res) => {
  try {
    const { staff, staffdept, roleassigned } = req.body;
    const newRole = new roleModel({
      staff,
      staffdept,
      roleassigned
    });
    await newRole.save();
    res
      .status(201)
      .json({ message: "Role assigned successfully", role: newRole });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error assigning role", error: error.message });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await roleModel.find();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching roles", error: error.message });
  }
};
