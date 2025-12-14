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
const Driver = require("../models/driverModel.js");

exports.registerStaff = async (req, res) => {
  try {
    // If using Multer: req.body contains text fields, req.files contains files.
    // If using a dedicated file upload service (like Cloudinary), this function 
    // should ideally receive *only* the URLs, but since the FE is sending raw FormData, 
    // we use a general structure to handle all incoming fields.

    // 1. Destructure all expected fields from req.body
    const {
      fullName,
      designation,
      contactNumber,
      alternateContactNumber,
      licenseNumber,
      aadhaarNumber,
      completeAddress,
      // New fields
      status,
      dob,
      maritalStatus,
      bloodGroup,
      gender,
      nationality,
      category,
      totalExperience,
      previousEmployer,
      bankName,
      branchName,
      accountNumber,
      ifscCode,
      panNumber,
    } = req.body;
    
    // 2. Map file URLs. NOTE: If you are NOT using a pre-upload process (like Cloudinary),
    // these fields will contain the Multer file paths (req.file.path).
    // Assuming a simplified structure here:
    // If files are sent as separate files (not in req.body), they will be in req.files
    // We mock the file handling here as the final version requires backend setup.
    const photoUrl = req.body.photoUrl || (req.files && req.files['photo'] ? req.files['photo'][0].path : null);
    const aadhaarFileUrl = req.body.aadhaarFileUrl || (req.files && req.files['aadhaarFile'] ? req.files['aadhaarFile'][0].path : null);
    const resumeFileUrl = req.body.resumeFileUrl || (req.files && req.files['resumeFile'] ? req.files['resumeFile'][0].path : null);


    // 3. Construct the staff data object
    const staffData = {
      fullName,
      designation,
      contactNumber,
      alternateContactNumber,
      licenseNumber: designation === 'Driver' ? licenseNumber : null, // Set null for supervisors if field is mandatory for driver only
      aadhaarNumber,
      completeAddress,
      // Personal
      dob, maritalStatus, bloodGroup, gender, nationality, category,
      firstName: req.body.firstName, middleName: req.body.middleName, lastName: req.body.lastName,
      // Bank
      bankName, branchName, accountNumber, ifscCode, panNumber,
      // Experience
      totalExperience, previousEmployer,
      // Status & Files
      status,
      photoUrl: photoUrl,
      aadhaarFileUrl: aadhaarFileUrl,
      resumeFileUrl: resumeFileUrl,
    };

    // 4. Save data based on designation
    let savedStaff;
    if (designation === 'Driver') {
        // Driver model uses vid, which is currently generated in the frontend (DUMMY_VID_). 
        // We ensure we pass all the driver fields.
        const driverData = { ...staffData, vid: req.body.vid };
        savedStaff = new Driver(driverData);
    } else if (designation === 'Supervisor') {
        savedStaff = new Staff(staffData);
    } else {
        return res.status(400).json({ success: false, message: "Invalid designation" });
    }

    await savedStaff.save();

    res.status(201).json({
      success: true,
      message: `${designation} registered successfully`,
      data: savedStaff,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(400).json({
      success: false,
      message: "Error registering staff/driver",
      error: error.message || error.toString(),
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