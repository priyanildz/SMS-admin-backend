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
        // Destructure all expected fields from req.body
        const {
            fullName,
            designation,
            contactNumber,
            alternateContactNumber,
            licenseNumber,
            aadhaarNumber,
            completeAddress,
            // New personal fields
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
            // Split name fields (needed for schema validation)
            firstName,
            middleName,
            lastName,
        } = req.body;
        
        // 🚨 IMPORTANT: The backend must be configured to upload files (photo, aadhaar, resume) 
        // using middleware (like Multer) and then replace the file objects with the final Cloudinary URLs.
        // Assuming file paths are available here (or replaced with URLs in middleware):
        const getFileUrl = (fieldName) => req.body[`${fieldName}Url`] || (req.files && req.files[fieldName] ? req.files[fieldName][0].path : null);

        const staffData = {
            fullName,
            designation,
            contactNumber,
            alternateContactNumber,
            licenseNumber: designation === 'Driver' ? licenseNumber : null,
            aadhaarNumber,
            completeAddress,
            
            // Personal
            dob, maritalStatus, bloodGroup, gender, nationality, category,
            firstName, middleName, lastName,
            // Bank
            bankName, branchName, accountNumber, ifscCode, panNumber,
            // Experience
            totalExperience, previousEmployer,
            // Status & Files
            status,
            photoUrl: getFileUrl('photo'),
            aadhaarFileUrl: getFileUrl('aadhaarFile'),
            resumeFileUrl: getFileUrl('resumeFile'),
        };

        let savedStaff;
        if (designation === 'Driver') {
            // 🚨 ISSUE: The FE generates a DUMMY_VID. We need a real logic for 'vid'.
            // For now, we assume vid comes from req.body (as the FE sends it)
            const driverData = { ...staffData, vid: req.body.vid || `AUTO_VID_${Date.now()}` }; 
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