// const Staff = require("../models/vehicleSupervisior");

// exports.registerStaff = async (req, res) => {
//   try {
//     const {
//       fullName,
//       designation,
//       contactNumber,
//       alternateContactNumber,
//       licenseNumber,
//       aadhaarNumber,
//       completeAddress,
//     } = req.body;

//     // Create new staff entry
//     const staff = new Staff({
//       fullName,
//       designation,
//       contactNumber,
//       alternateContactNumber,
//       licenseNumber,
//       aadhaarNumber,
//       completeAddress,
//     });

//     await staff.save();

//     res.status(201).json({
//       success: true,
//       message: "Staff registered successfully",
//       data: staff,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(400).json({
//       success: false,
//       message: "Error registering staff",
//       error: error.message,
//     });
//   }
// };

// // @desc Get all staff
// // @route GET /api/staff
// exports.getAllStaff = async (req, res) => {
//   try {
//     const staff = await Staff.find();
//     res.status(200).json({ success: true, data: staff });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc Get single staff by ID
// // @route GET /api/staff/:id
// exports.getStaffById = async (req, res) => {
//   try {
//     const staff = await Staff.findById(req.params.id);
//     if (!staff) {
//       return res.status(404).json({ success: false, message: "Staff not found" });
//     }
//     res.status(200).json({ success: true, data: staff });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc Update staff
// // @route PUT /api/staff/:id
// exports.updateStaff = async (req, res) => {
//   try {
//     const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!staff) {
//       return res.status(404).json({ success: false, message: "Staff not found" });
//     }
//     res.status(200).json({ success: true, message: "Staff updated", data: staff });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // @desc Delete staff
// // @route DELETE /api/staff/:id
// exports.deleteStaff = async (req, res) => {
//   try {
//     const staff = await Staff.findByIdAndDelete(req.params.id);
//     if (!staff) {
//       return res.status(404).json({ success: false, message: "Staff not found" });
//     }
//     res.status(200).json({ success: true, message: "Staff deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// In controllers/vehicleSupervisorController.js

const Staff = require("../models/vehicleSupervisior.js");

exports.registerStaff = async (req, res) => {
  try {
    // 1. Log the incoming data to see that multer is working
    console.log("Body received:", req.body);
    console.log("File received:", req.file);

    // 2. Destructure the text fields from req.body
    const {
      fullName,
      designation,
      contactNumber,
      alternateContactNumber,
      licenseNumber,
      aadhaarNumber,
      completeAddress,
    } = req.body;

    // 3. Create a data object that we can add the photo to
    const staffData = {
      fullName,
      designation,
      contactNumber,
      alternateContactNumber,
      licenseNumber,
      aadhaarNumber,
      completeAddress,
    };

    // 4. Check if a file was uploaded and add its path to our data object
    if (req.file) {
      // NOTE: This saves the file's path. This works if you configure multer
      // to save files to a folder. Later, you would replace this line
      // with your Cloudinary upload logic to get a URL.
      staffData.photo = req.file.path;
    }

    // 5. Create the new staff member using the complete data object
    const staff = new Staff(staffData);
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

// ... your other controller functions (getAllStaff, etc.) remain the same
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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