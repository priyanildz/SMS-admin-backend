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

const getFileUrl = (req, fieldName) => {
    // Check if files were processed by multer and are available in req.files
    const file = req.files && req.files[fieldName] ? req.files[fieldName][0] : null;
    if (file) {
        // Assumes Multer or similar sets a path. If using a pre-upload (e.g., Cloudinary), 
        // the URL should be sent back in req.body for a separate field (e.g., 'aadhaarFileUrl')
        return file.path; 
    }
    // Fallback: Check req.body for a pre-uploaded URL (common pattern)
    // NOTE: For this specific form structure, files are sent via FormData, 
    // so this check will primarily rely on 'file.path' after middleware processing.
    return null;
};

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
            // vid is sent by FE for Driver schema validation
            vid
        } = req.body;
        
        // --- File/URL Mapping ---
        // We assume req.files is populated by a middleware like Multer. 
        // These will be the file paths/temp locations which must exist for Mongoose validation.
        const photoUrl = getFileUrl(req, 'photo'); 
        const aadhaarFileUrl = getFileUrl(req, 'aadhaarFile');
        const resumeFileUrl = getFileUrl(req, 'resumeFile');

        // 🌟 CRITICAL VALIDATION CHECK FOR REQUIRED FILES 🌟
        if (!aadhaarFileUrl) {
            return res.status(400).json({ success: false, message: "Aadhaar document file is missing." });
        }
        if (!resumeFileUrl) {
            return res.status(400).json({ success: false, message: "Resume document file is missing." });
        }
        // Note: photo is optional on schema but required by FE, frontend validation handles it.

        const staffData = {
            fullName,
            designation,
            contactNumber,
            alternateContactNumber,
            // 🚨 FIX: Explicitly set licenseNumber to null for Supervisor to avoid DB uniqueness/validation issues 
            // if the field is not present/empty in the payload for a Supervisor, but keep it for Driver logic.
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
            photoUrl: photoUrl || req.body.photoUrl, // Fallback for pre-uploaded photo
            aadhaarFileUrl: aadhaarFileUrl,
            resumeFileUrl: resumeFileUrl,
        };

        let savedStaff;
        if (designation === 'Driver') {
            // Use FE-generated vid
            const driverData = { ...staffData, vid: vid }; 
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
        // Better error message extraction from Mongoose ValidationError
        let validationErrors = {};
        if (error.name === 'ValidationError') {
            Object.keys(error.errors).forEach((key) => {
                validationErrors[key] = error.errors[key].message;
            });
            // Return specific validation messages
            return res.status(400).json({
                success: false,
                message: "Mongoose Validation Failed",
                errors: validationErrors,
            });
        }
        // Return generic error otherwise
        res.status(400).json({
            success: false,
            message: "Error registering staff/driver (Validation or DB issue)",
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