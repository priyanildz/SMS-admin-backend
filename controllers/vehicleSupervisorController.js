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









// const Staff = require("../models/vehicleSupervisior.js");
// const Driver = require("../models/driverModel.js");

// /**
//  * REGISTER SUPERVISOR / DRIVER
//  * Files are ALREADY uploaded from frontend to Cloudinary.
//  * Backend receives ONLY URLs in req.body.
//  */
// exports.registerStaff = async (req, res) => {
//   try {
//     // Destructure all expected fields from req.body
//     const {
//       fullName,
//       designation,
//       contactNumber,
//       alternateContactNumber,
//       licenseNumber,
//       aadhaarNumber,
//       completeAddress,

//       // Personal details
//       status,
//       dob,
//       maritalStatus,
//       bloodGroup,
//       gender,
//       nationality,
//       category,
//       totalExperience,
//       previousEmployer,

//       // Bank details
//       bankName,
//       branchName,
//       accountNumber,
//       ifscCode,
//       panNumber,

//       // Split name fields
//       firstName,
//       middleName,
//       lastName,

//       // Driver-specific
//       vid,

//       // ✅ PRE-UPLOADED FILE URLS (from frontend)
//       photoUrl,
//       aadhaarFileUrl,
//       resumeFileUrl,
//     } = req.body;

//     // 🌟 REQUIRED FILE VALIDATION 
//     if (!aadhaarFileUrl) {
//       return res.status(400).json({
//         success: false,
//         message: "Aadhaar document file is missing.",
//       });
//     }

//     if (!resumeFileUrl) {
//       return res.status(400).json({
//         success: false,
//         message: "Resume document file is missing.",
//       });
//     }

//     // Construct common staff data
//     const staffData = {
//       fullName,
//       designation,
//       contactNumber,
//       alternateContactNumber,

//       // 🚨 FIX: licenseNumber only for Driver
//       licenseNumber: designation === "Driver" ? licenseNumber : null,

//       aadhaarNumber,
//       completeAddress,

//       // Personal
//       dob,
//       maritalStatus,
//       bloodGroup,
//       gender,
//       nationality,
//       category,

//       firstName,
//       middleName,
//       lastName,

//       // Bank
//       bankName,
//       branchName,
//       accountNumber,
//       ifscCode,
//       panNumber,

//       // Experience
//       totalExperience,
//       previousEmployer,

//       // Status & Files
//       status,
//       photoUrl,
//       aadhaarFileUrl,
//       resumeFileUrl,
//     };

//     let savedStaff;

//     if (designation === "Driver") {
//       // ✅ CRITICAL FIX: Add the required 'driverName' field for the Driver schema
//       const driverData = { 
//         ...staffData, 
//         vid,
//         driverName: fullName, // <-- ADDED: Maps the frontend's fullName to the schema's driverName
//       };
//       savedStaff = new Driver(driverData);
//     } 
//     else if (designation === "Supervisor") {
//       // Supervisor schema does not require 'driverName' or 'vid'
//       savedStaff = new Staff(staffData);
//     } 
//     else {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid designation",
//       });
//     }

//     await savedStaff.save();

//     res.status(201).json({
//       success: true,
//       message: `${designation} registered successfully`,
//       data: savedStaff,
//     });
//   } catch (error) {
//     console.error("Registration Error:", error);

//     // Handle Mongoose validation errors cleanly
//     if (error.name === "ValidationError") {
//       const validationErrors = {};
//       Object.keys(error.errors).forEach((key) => {
//         validationErrors[key] = error.errors[key].message;
//       });

//       return res.status(400).json({
//         success: false,
//         message: "Mongoose Validation Failed",
//         errors: validationErrors,
//       });
//     }

//     // Handle duplicate key errors (unique fields)
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "Duplicate entry detected",
//         error: error.keyValue,
//       });
//     }

//     // Generic error
//     res.status(400).json({
//       success: false,
//       message: "Error registering staff/driver",
//       error: error.message || error.toString(),
//     });
//   }
// };

// /**
//  * GET ALL SUPERVISORS
//  */
// exports.getAllStaff = async (req, res) => {
//   try {
//     const staff = await Staff.find();
//     res.status(200).json({ success: true, data: staff });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// /**
//  * GET SUPERVISOR BY ID
//  */
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

// /**
//  * UPDATE SUPERVISOR
//  */
// exports.updateStaff = async (req, res) => {
//   try {
//     const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!staff) {
//       return res.status(404).json({ success: false, message: "Staff not found" });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Staff updated",
//       data: staff,
//     });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// /**
//  * DELETE SUPERVISOR
//  */
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











// const Staff = require("../models/vehicleSupervisior.js");
// const Driver = require("../models/driverModel.js");

// /**
//  * REGISTER SUPERVISOR / DRIVER
//  * Files are ALREADY uploaded from frontend to Cloudinary.
//  * Backend receives ONLY URLs in req.body.
//  */
// exports.registerStaff = async (req, res) => {
//   try {
//     // Destructure all expected fields from req.body
//     const {
//       fullName,
//       designation,
//       contactNumber,
//       alternateContactNumber,
//       licenseNumber,
//       aadhaarNumber,
//       completeAddress,

//       // Personal details
//       status,
//       dob,
//       maritalStatus,
//       bloodGroup,
//       gender,
//       nationality,
//       category,
//       totalExperience,
//       previousEmployer,

//       // Bank details
//       bankName,
//       branchName,
//       accountNumber,
//       ifscCode,
//       panNumber,

//       // Split name fields
//       firstName,
//       middleName,
//       lastName,
      
//       // Driver-specific
//       vid,
      
//       // ✅ CRITICAL FIX: Add the email field to the destructuring
//       email, // <--- ADDED THE MISSING EMAIL FIELD
      
//       // ✅ PRE-UPLOADED FILE URLS (from frontend)
//       photoUrl,
//       aadhaarFileUrl,
//       resumeFileUrl,
//     } = req.body;

//     // 🌟 REQUIRED FILE VALIDATION 
//     if (!aadhaarFileUrl) {
//       return res.status(400).json({
//         success: false,
//         message: "Aadhaar document file is missing.",
//       });
//     }

//     if (!resumeFileUrl) {
//       return res.status(400).json({
//         success: false,
//         message: "Resume document file is missing.",
//       });
//     }

//     // Construct common staff data
//     const staffData = {
//       fullName,
//       designation,
//       contactNumber,
//       alternateContactNumber,
      
//       // The local variable 'email' is now defined and holds the correct value
//       email, // <--- THIS NOW INCLUDES THE EMAIL VALUE

//       // 🚨 FIX: licenseNumber only for Driver
//       licenseNumber: designation === "Driver" ? licenseNumber : null,

//       aadhaarNumber,
//       completeAddress,

//       // Personal
//       dob,
//       maritalStatus,
//       bloodGroup,
//       gender,
//       nationality,
//       category,

//       firstName,
//       middleName,
//       lastName,

//       // Bank
//       bankName,
//       branchName,
//       accountNumber,
//       ifscCode,
//       panNumber,

//       // Experience
//       totalExperience,
//       previousEmployer,

//       // Status & Files
//       status,
//       photoUrl,
//       aadhaarFileUrl,
//       resumeFileUrl,
//     };

//     let savedStaff;

//     if (designation === "Driver") {
//       // ✅ CRITICAL FIX: Add the required 'driverName' field for the Driver schema
//       const driverData = { 
//         ...staffData, 
//         vid,
//         driverName: fullName, // Maps the frontend's fullName to the schema's driverName
//       };
//       savedStaff = new Driver(driverData);
//     } 
//     else if (designation === "Supervisor") {
//       // Supervisor schema does not require 'driverName' or 'vid'
//       savedStaff = new Staff(staffData);
//     } 
//     else {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid designation",
//       });
//     }

//     await savedStaff.save();

//     res.status(201).json({
//       success: true,
//       message: `${designation} registered successfully`,
//       data: savedStaff,
//     });
//   } catch (error) {
//     console.error("Registration Error:", error);

//     // Handle Mongoose validation errors cleanly
//     if (error.name === "ValidationError") {
//       const validationErrors = {};
//       Object.keys(error.errors).forEach((key) => {
//         validationErrors[key] = error.errors[key].message;
//       });

//       return res.status(400).json({
//         success: false,
//         message: "Mongoose Validation Failed",
//         errors: validationErrors,
//       });
//     }

//     // Handle duplicate key errors (unique fields)
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "Duplicate entry detected",
//         error: error.keyValue,
//       });
//     }

//     // Generic error
//     res.status(400).json({
//       success: false,
//       message: "Error registering staff/driver",
//       error: error.message || error.toString(),
//     });
//   }
// };

// /**
//  * GET ALL SUPERVISORS
//  */
// exports.getAllStaff = async (req, res) => {
//   try {
//     const staff = await Staff.find();
//     res.status(200).json({ success: true, data: staff });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// /**
//  * GET SUPERVISOR BY ID
//  */
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

// /**
//  * UPDATE SUPERVISOR
//  */
// exports.updateStaff = async (req, res) => {
//   try {
//     const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!staff) {
//       return res.status(404).json({ success: false, message: "Staff not found" });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Staff updated",
//       data: staff,
//     });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// /**
//  * DELETE SUPERVISOR
//  */
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
















const Staff = require("../models/vehicleSupervisior.js");
const Driver = require("../models/driverModel.js");

/**
 * REGISTER SUPERVISOR / DRIVER
 * Files are ALREADY uploaded from frontend to Cloudinary.
 * Backend receives ONLY URLs in req.body.
 */
// exports.registerStaff = async (req, res) => {
// 	try {
// 		// Destructure all expected fields from req.body
// 		const {
// 			fullName,
// 			designation,
// 			contactNumber,
// 			alternateContactNumber,
// 			licenseNumber,
// 			aadhaarNumber,
// 			completeAddress,

// 			// Personal details
// 			status,
// 			dob,
// 			maritalStatus,
// 			bloodGroup,
// 			gender,
// 			nationality,
// 			category,
// 			totalExperience,
// 			previousEmployer,

// 			// Bank details
// 			bankName,
// 			branchName,
// 			accountNumber,
// 			ifscCode,
// 			panNumber,

// 			// Split name fields
// 			firstName,
// 			middleName,
// 			lastName,

// 			// Driver-specific
// 			vid,

// 			// ✅ CRITICAL FIX: Add the email field to the destructuring
// 			email, // <--- ADDED THE MISSING EMAIL FIELD

// 			// ✅ PRE-UPLOADED FILE URLS (from frontend)
// 			photoUrl,
// 			aadhaarFileUrl,
// 			resumeFileUrl,
// 		} = req.body;

// 		// 🌟 REQUIRED FILE VALIDATION
// 		if (!aadhaarFileUrl) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "Aadhaar document file is missing.",
// 			});
// 		}

// 		if (!resumeFileUrl) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "Resume document file is missing.",
// 			});
// 		}

// 		// Construct common staff data
// 		const staffData = {
// 			fullName,
// 			designation,
// 			contactNumber,
// 			alternateContactNumber,

// 			// The local variable 'email' is now defined and holds the correct value
// 			email, // <--- THIS NOW INCLUDES THE EMAIL VALUE

// 			// 🚨 FIX: licenseNumber only for Driver
// 			licenseNumber: designation === "Driver" ? licenseNumber : null,

// 			aadhaarNumber,
// 			completeAddress,

// 			// Personal
// 			dob,
// 			maritalStatus,
// 			bloodGroup,
// 			gender,
// 			nationality,
// 			category,

// 			firstName,
// 			middleName,
// 			lastName,

// 			// Bank
// 			bankName,
// 			branchName,
// 			accountNumber,
// 			ifscCode,
// 			panNumber,

// 			// Experience
// 			totalExperience,
// 			previousEmployer,

// 			// Status & Files
// 			status,
// 			photoUrl,
// 			aadhaarFileUrl,
// 			resumeFileUrl,
// 		};

// 		let savedStaff;

// 		if (designation === "Driver") {
// 			// ✅ CRITICAL FIX: Add the required 'driverName' field for the Driver schema
// 			const driverData = {
// 				...staffData,
// 				vid,
// 				driverName: fullName, // Maps the frontend's fullName to the schema's driverName
// 			};
// 			savedStaff = new Driver(driverData);
// 		} else if (designation === "Supervisor") {
// 			// Supervisor schema does not require 'driverName' or 'vid'
// 			savedStaff = new Staff(staffData);
// 		} else {
// 			return res.status(400).json({
// 				success: false,
// 				message: "Invalid designation",
// 			});
// 		}

// 		await savedStaff.save();

// 		res.status(201).json({
// 			success: true,
// 			message: `${designation} registered successfully`,
// 			data: savedStaff,
// 		});
// 	} catch (error) {
// 		console.error("Registration Error:", error);

// 		// Handle Mongoose validation errors cleanly
// 		if (error.name === "ValidationError") {
// 			const validationErrors = {};
// 			Object.keys(error.errors).forEach((key) => {
// 				validationErrors[key] = error.errors[key].message;
// 			});

// 			return res.status(400).json({
// 				success: false,
// 				message: "Mongoose Validation Failed",
// 				errors: validationErrors,
// 			});
// 		}

// 		// Handle duplicate key errors (unique fields)
// 		if (error.code === 11000) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "Duplicate entry detected",
// 				error: error.keyValue,
// 			});
// 		}

// 		// Generic error
// 		res.status(400).json({
// 			success: false,
// 			message: "Error registering staff/driver",
// 			error: error.message || error.toString(),
// 		});
// 	}
// };

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

            // Personal details
            status,
            dob,
            maritalStatus,
            bloodGroup,
            gender,
            nationality,
            category,
            totalExperience,
            previousEmployer,

            // Bank details
            bankName,
            branchName,
            accountNumber,
            ifscCode,
            panNumber,

            // Split name fields
            firstName,
            middleName,
            lastName,

            // Driver-specific
            vid,

            // Email field
            email, 

            // PRE-UPLOADED FILE URLS (from frontend)
            photoUrl,
            aadhaarFileUrl,
            resumeFileUrl,
        } = req.body;

        // REQUIRED FILE VALIDATION
        if (!aadhaarFileUrl) {
            return res.status(400).json({
                success: false,
                message: "Aadhaar document file is missing.",
            });
        }

        if (!resumeFileUrl) {
            return res.status(400).json({
                success: false,
                message: "Resume document file is missing.",
            });
        }

        // Construct common staff data
        const staffData = {
            fullName,
            designation,
            contactNumber,
            alternateContactNumber,
            email,
            aadhaarNumber,
            completeAddress,

            // Personal
            dob,
            maritalStatus,
            bloodGroup,
            gender,
            nationality,
            category,

            firstName,
            middleName,
            lastName,

            // Bank
            bankName,
            branchName,
            accountNumber,
            ifscCode,
            panNumber,

            // Experience
            totalExperience,
            previousEmployer,

            // Status & Files
            status,
            photoUrl,
            aadhaarFileUrl,
            resumeFileUrl,
        };

        let savedStaff;

        if (designation === "Driver") {
            // Drivers require licenseNumber, driverName, and vid
            const driverData = {
                ...staffData,
                licenseNumber, // Included only for Drivers
                vid,
                driverName: fullName, 
            };
            savedStaff = new Driver(driverData);
        } else if (designation === "Supervisor") {
            /**
             * FIX: Completely exclude licenseNumber for Supervisors.
             * This prevents Mongoose from sending 'null' and triggering 
             * unique constraint errors in MongoDB.
             */
            savedStaff = new Staff(staffData);
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid designation",
            });
        }

        await savedStaff.save();

        res.status(201).json({
            success: true,
            message: `${designation} registered successfully`,
            data: savedStaff,
        });
    } catch (error) {
        console.error("Registration Error:", error);

        if (error.name === "ValidationError") {
            const validationErrors = {};
            Object.keys(error.errors).forEach((key) => {
                validationErrors[key] = error.errors[key].message;
            });

            return res.status(400).json({
                success: false,
                message: "Mongoose Validation Failed",
                errors: validationErrors,
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Duplicate entry detected",
                error: error.keyValue,
            });
        }

        res.status(400).json({
            success: false,
            message: "Error registering staff/driver",
            error: error.message || error.toString(),
        });
    }
};






/**
 * NEW FUNCTION: Handles PUT request to update Driver/Supervisor data.
 */
exports.updateStaffDetails = async (req, res) => {
	try {
		const staffId = req.params.id;
		const updateData = req.body;
		const { designation } = updateData;

		let Model;
		let staffType = designation;

		// 1. Determine the correct Mongoose Model
		if (designation === 'Driver') {
			Model = Driver;
            // The Driver model uses 'driverName' instead of 'fullName'
            updateData.driverName = updateData.fullName;
		} else if (designation === 'Supervisor') {
			Model = Staff;
		} else {
			// Fallback check if designation is missing in update body
			const foundStaff = await Staff.findById(staffId);
			if (foundStaff) {
				Model = Staff;
				staffType = 'Supervisor';
			} else {
				const foundDriver = await Driver.findById(staffId);
				if (foundDriver) {
					Model = Driver;
					staffType = 'Driver';
				} else {
					return res.status(404).json({ success: false, message: "Staff record not found." });
				}
			}
		}
        
        // 2. Perform the update
		const updatedStaff = await Model.findByIdAndUpdate(staffId, updateData, {
			new: true, // Return the updated document
			runValidators: true, // Run Mongoose validation checks
		});

		if (!updatedStaff) {
			return res.status(404).json({ success: false, message: `${staffType} not found for update.` });
		}

		res.status(200).json({
			success: true,
			message: `${staffType} updated successfully`,
			data: updatedStaff,
		});
	} catch (error) {
		console.error("Staff Update Error:", error);

		// Handle Mongoose validation errors
		if (error.name === "ValidationError") {
			const validationErrors = {};
			Object.keys(error.errors).forEach((key) => {
				validationErrors[key] = error.errors[key].message;
			});

			return res.status(400).json({
				success: false,
				message: "Mongoose Validation Failed during update.",
				errors: validationErrors,
			});
		}
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Duplicate entry detected in unique fields (e.g., Aadhaar, PAN).",
                error: error.keyValue,
            });
        }

		// Generic error
		res.status(400).json({
			success: false,
			message: "Error updating staff details.",
			error: error.message || error.toString(),
		});
	}
};

/**
 * GET ALL SUPERVISORS
 */
exports.getAllStaff = async (req, res) => {
	try {
		const staff = await Staff.find();
		res.status(200).json({ success: true, data: staff });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

/**
 * GET SUPERVISOR BY ID
 */
exports.getStaffById = async (req, res) => {
	try {
        // Find staff in supervisor collection
		let staff = await Staff.findById(req.params.id); 

        // If not found, try driver collection (handles combined list viewing)
        if (!staff) {
            staff = await Driver.findById(req.params.id);
        }

		if (!staff) {
			return res.status(404).json({ success: false, message: "Staff not found" });
		}
		res.status(200).json({ success: true, data: staff });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

/**
 * UPDATE SUPERVISOR (Original function)
 * NOTE: This function is now deprecated in favor of updateStaffDetails.
 */
exports.updateStaff = async (req, res) => {
	try {
		const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!staff) {
			return res.status(404).json({ success: false, message: "Staff not found" });
		}

		res.status(200).json({
			success: true,
			message: "Staff updated",
			data: staff,
		});
	} catch (error) {
		res.status(400).json({ success: false, message: error.message });
	}
};

/**
 * DELETE SUPERVISOR
 */
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