const Staff = require("../models/vehicleSupervisior");

exports.registerStaff = async (req, res) => {
  try {
    const {
      fullName,
      designation,
      contactNumber,
      alternateContactNumber,
      licenseNumber,
      aadhaarNumber,
      completeAddress,
    } = req.body;

    // Create new staff entry
    const staff = new Staff({
      fullName,
      designation,
      contactNumber,
      alternateContactNumber,
      licenseNumber,
      aadhaarNumber,
      completeAddress,
    });

    await staff.save();

    res.status(201).json({
      success: true,
      message: "Staff registered successfully",
      data: staff,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Error registering staff",
      error: error.message,
    });
  }
};

// @desc Get all staff
// @route GET /api/staff
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single staff by ID
// @route GET /api/staff/:id
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update staff
// @route PUT /api/staff/:id
exports.updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }
    res.status(200).json({ success: true, message: "Staff updated", data: staff });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc Delete staff
// @route DELETE /api/staff/:id
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }
    res.status(200).json({ success: true, message: "Staff deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
