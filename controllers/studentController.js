// const StudentLC = require("../models/StudentLCModel");
// const User = require("../models/studentModel");
// const studentsAttendence = require("../models/studentAttendence");

// // ----------------------------------------------------
// // Student Management Endpoints
// // ----------------------------------------------------

// exports.createUser = async (req, res) => {
//   try {
//     const user = new User(req.body);
//     await user.save();
//     // Use 201 for resource creation
//     res.status(201).json({ message: "Student created successfully" });
//   } catch (error) {
//     console.error("Error creating student:", error);

//     // Mongoose duplicate unique fields (Code 11000)
//     if (error.code && error.code === 11000) {
//       // Return 409 Conflict for unique field violations (e.g., duplicate studentid)
//       return res.status(409).json({
//         message: "Data conflict: A student with this unique ID/number already exists.",
//         error: error.message
//       });
//     }

//     // Mongoose validation errors (e.g., missing 'required' field)
//     if (error.name === "ValidationError") {
//       // Return 400 Bad Request for validation issues
//       return res.status(400).json({
//         message: "Validation failed. Please check all required fields and data formats.",
//         errors: error.message,
//       });
//     }

//     // Fallback for general server errors
//     res.status(500).json({ error: error.message, message: "Internal Server Error during student creation." });
//   }
// };

// exports.getStudents = async (req, res) => {
//   try {
//     const students = await User.find({ status: { $ne: false } }); // Only fetch active students
//     res.status(200).json(students);
//   } catch (error) {
//     console.error("Error fetching students:", error);
//     res.status(500).json({ error: error.message, message: "Internal Server Error." });
//   }
// };

// exports.getNewStudents = async (req, res) => {
//   try {
//     const students = await User.find({
//       "admission.admissiondate": {
//         $gte: new Date("2024-01-01"), // Consider passing the date as a query parameter for flexibility
//       },
//       status: {
//         $ne: false // Only new, non-LC students
//       }
//     });
//     return res.status(200).send(students);
//   } catch (error) {
//     console.error("Error fetching new students:", error);
//     return res.status(500).send({ message: "Error fetching new students: " + error.message });
//   }
// };

// exports.getStudentById = async (req, res) => {
//   try {
//     // Standard practice is to get ID from params for GET requests, 
//     // but the original code used req.body. I've updated it to use a unified `id` from body or params.
//     const id = req.body.id || req.params.id; 
    
//     if (!id) {
//       return res.status(400).send({ message: "Please provide student ID" });
//     }
    
//     const data = await User.findById(id);
    
//     if (!data) {
//       return res.status(404).send({ message: "Student not found!" });
//     }
    
//     return res.status(200).send(data);
//   } catch (error) {
//     // If the ID format is invalid (e.g., not a valid MongoDB ObjectId), Mongoose throws a CastError.
//     if (error.name === 'CastError') {
//       return res.status(400).send({ message: "Invalid student ID format." });
//     }
//     console.error("Error in getStudentById:", error);
//     return res.status(500).send({ message: "Server error fetching student by ID", error: error.message });
//   }
// };

// exports.getStudentByStd = async (req, res) => {
//   try {
//     // Using req.query or req.params is generally better for GET filter operations
//     // but sticking to req.body as per the original code.
//     const { standard, division } = req.body;
    
//     if (!standard || !division) {
//       return res
//         .status(400) // Changed from 500 to 400
//         .json({ error: "Standard and Division are required" });
//     }

//     const response = await User.find({
//       "admission.admissionstd": standard,
//       "admission.admissiondivision": division,
//       status: { $ne: false } // Only show active students
//     });
    
//     if (response.length === 0) {
//       return res.status(404).json({ message: "No students found for this Standard and Division." });
//     }

//     return res.status(200).json(response);
//   } catch (error) {
//     console.error("Error fetching students by standard/division:", error); 
    
//     return res.status(500).json({ 
//         error: error.message, 
//         message: "Internal server error during student query." 
//     });
//   }
// };

// exports.editStudent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedData = req.body; 
    
//     // The runValidators: true option ensures Mongoose validation runs on the update
//     const updatedStudent = await User.findByIdAndUpdate(
//       id,
//       updatedData,
//       { new: true, runValidators: true }
//     );
    
//     if (!updatedStudent) {
//       return res.status(404).json({ message: "Student not found" });
//     }
    
//     res.status(200).json({ message: "Student updated successfully", updatedStudent });
//   } catch (error) {
//     console.error("Error updating student:", error);

//     // Specific error handling for Mongoose validation
//     if (error.name === "ValidationError") {
//       return res.status(400).json({
//         message: "Update failed due to validation errors.",
//         errors: error.message, 
//       });
//     }

//     // Specific error handling for Mongoose duplicate unique fields
//     if (error.code && error.code === 11000) {
//       return res.status(409).json({
//         message: "Data conflict: This updated data violates a unique field constraint.",
//       });
//     }
    
//     // General error for invalid ID format
//     if (error.name === 'CastError') {
//       return res.status(400).json({ message: "Invalid student ID format for update." });
//     }
    
//     res.status(500).json({ error: "Internal server error during student update." });
//   }
// };

// // ----------------------------------------------------
// // LC (Leaving Certificate) Endpoints
// // ----------------------------------------------------

// // FIXED: The missing closing curly braces in the original code.
// exports.addLcStudents = async (req, res) => {
//   try {
//     const { studentid } = req.params;
    
//     const newLcStudent = await User.findByIdAndUpdate(
//       studentid,
//       { status: false }, // Set status to false to mark as LC student
//       { new: true }
//     )
    
//     if (!newLcStudent) {
//       return res.status(404).send({ message: 'No student found with this ID!' })
//     }
    
//     // Check if the student was actually set to false (already being an LC student wouldn't hurt)
//     if (newLcStudent.status === false) {
//       return res.status(200).send({ message: 'Student successfully marked for Leaving Certificate (status: false).' })
//     } else {
//       return res.status(200).send({ message: 'Student status updated, but confirmation needed.' })
//     }

//   } catch (error) {
//     console.error(error)
    
//     if (error.name === 'CastError') {
//       return res.status(400).send({ message: "Invalid student ID format." });
//     }

//     return res.status(500).send({
//       message: 'Error while updating LC student status.',
//       error: error.message
//     });
//   }
// };

// exports.getLCStudents = async (req, res) => {
//   try {
//     const lcStudents = await User.find({
//       status: false // Find all students marked with status: false
//     })
    
//     if (lcStudents.length === 0) {
//       return res.status(200).send({ message: 'No LC Students found.' })
//     }
    
//     return res.status(200).send(lcStudents)
//   } catch (error) {
//     console.error("Error In LC students: ", error)
//     return res.status(500).send({ message: "Internal Server Error fetching LC students.", error: error.message })
//   }
// };

// // ----------------------------------------------------
// // Attendance Endpoints
// // ----------------------------------------------------

// exports.addAttendence = async (req, res) => {
//   try {
//     const { std, div, students, date } = req.body;

//     // Improved validation
//     if (!std || !div || !date || !students || !Array.isArray(students) || students.length === 0) {
//       return res.status(400).send({ message: "Please provide complete and valid data for attendance (standard, division, date, and a non-empty array of students)." });
//     }
    
//     // Check if attendance for this date/std/div already exists
//     const existingAttendance = await studentsAttendence.findOne({ std, div, date });
//     if (existingAttendance) {
//         return res.status(409).send({ message: "Attendance for this Standard, Division, and Date has already been recorded." });
//     }

//     const studentsData = new studentsAttendence({
//       std,
//       div,
//       students,
//       date
//     });
//     await studentsData.save();
//     return res.status(201).send({ message: "Students Attendance Added successfully!" });
//   } catch (error) {
//     console.error("Error adding attendance:", error);
//     res.status(500).send({ message: "Internal Server Error during attendance addition!:- " + error.message });
//   }
// };

// exports.getAttendance = async (req, res) => {
//   try {
//     // Recommended to use req.query for GET filters, but maintaining req.body structure
//     const { std, div, date } = req.body;      
    
//     if (!std || !div || !date) {
//       return res.status(400).send({ message: "Please provide complete data (Standard, Division, and Date)!" });
//     }
    
//     const attendance = await studentsAttendence.findOne({
//       std,
//       div,
//       date
//     });
    
//     if (!attendance) {
//       return res.status(404).send({ message: "No attendance found for the specified criteria!" });
//     }

//     return res.status(200).send(attendance);
//   } catch (error) {
//     console.error("Error fetching attendance:", error);
//     return res.status(500).send({ message: "Internal Server Error!:- " + error.message });
//   }
// };

// exports.getAllAttendance = async (req, res) => {
//   try {
//     const attendance = await studentsAttendence.find();
    
//     if (attendance.length === 0) {
//       return res.status(200).send({ message: "No attendance records found." });
//     }
    
//     return res.status(200).send(attendance);
//   } catch (error) {
//     console.error("Error fetching all attendance:", error);
//     return res.status(500).send({ message: "Internal Server Error!:- " + error.message });
//   }
// };

// exports.promoteStudents = async (req, res) => {
//     try {
//         const { studentIds, newStandard, newDivision } = req.body;

//         if (!studentIds || !newStandard || !Array.isArray(studentIds) || studentIds.length === 0) {
//             return res.status(400).json({ message: "Invalid input: studentIds and newStandard are required." });
//         }

//         // Use updateMany to efficiently update all selected students at once
//         const result = await User.updateMany(
//             { studentid: { $in: studentIds } }, // Filter: Find students whose studentid is in the list
//             {
//                 $set: {
//                     "admission.admissionstd": newStandard, // Set the new standard
//                     "admission.admissiondivision": newDivision || "", // Set the new division (optional)
//                     // You might also update the academic year here if necessary
//                 }
//             }
//         );

//         if (result.matchedCount === 0) {
//             return res.status(404).json({ message: "No matching students found to promote." });
//         }

//         return res.status(200).json({
//             message: `${result.modifiedCount} students promoted successfully to Standard ${newStandard}.`,
//             modifiedCount: result.modifiedCount
//         });
//     } catch (error) {
//         console.error("Error during student promotion:", error);
//         return res.status(500).json({ error: error.message, message: "Internal Server Error during promotion." });
//     }
// };













// const StudentLC = require("../models/StudentLCModel");
// const User = require("../models/studentModel");
// const studentsAttendence = require("../models/studentAttendence");

// // ----------------------------------------------------
// // Student Management Endpoints
// // ----------------------------------------------------

// exports.createUser = async (req, res) => {
//   try {
//     const user = new User(req.body);
//     await user.save();
//     // Use 201 for resource creation
//     res.status(201).json({ message: "Student created successfully" });
//   } catch (error) {
//     console.error("Error creating student:", error);

//     // Mongoose duplicate unique fields (Code 11000)
//     if (error.code && error.code === 11000) {
//       // Return 409 Conflict for unique field violations (e.g., duplicate studentid)
//       return res.status(409).json({
//         message: "Data conflict: A student with this unique ID/number already exists.",
//         error: error.message
//       });
//     }

//     // Mongoose validation errors (e.g., missing 'required' field)
//     if (error.name === "ValidationError") {
//       // Return 400 Bad Request for validation issues
//       return res.status(400).json({
//         message: "Validation failed. Please check all required fields and data formats.",
//         errors: error.message,
//       });
//     }

//     // Fallback for general server errors
//     res.status(500).json({ error: error.message, message: "Internal Server Error during student creation." });
//   }
// };

// // =================================================================
// // 🔥 FIX APPLIED HERE 🔥: Implement filtering using req.query parameters
// // =================================================================
// exports.getStudents = async (req, res) => {
//   try {
//     const { std, div, search } = req.query;
//     let query = { status: { $ne: false } }; // Start by filtering only active students

//     if (std) {
//       query["admission.admissionstd"] = std;
//     }
//     if (div) {
//       query["admission.admissiondivision"] = div;
//     }
    
//     // Add Search capability: search against firstname, lastname, or student ID
//     if (search) {
//       const searchRegex = new RegExp(search, "i"); // 'i' for case-insensitive
//       query.$or = [
//         { "firstname": searchRegex },
//         { "lastname": searchRegex },
//         // Assuming student ID is stored in the root of the User model or similar field
//         { "studentid": searchRegex }, 
//       ];
      
//       // If a standard or division filter is also active, merge them with the search query
//       if (std || div) {
//         query.$and = [
//           { status: { $ne: false } },
//           { ...query }, // Includes std and div filters if present
//           { $or: query.$or } // Includes the search fields
//         ];
//         // Clean up: remove the separate $or property and just keep the combined $and
//         delete query.$or;
//         delete query.status; 
        
//         // Re-apply the combined query to the main query object
//         query = { $and: query.$and };
//       }
//     }
    
//     // The final query object is passed to find()
//     const students = await User.find(query);

//     res.status(200).json(students);
//   } catch (error) {
//     console.error("Error fetching students:", error);
//     res.status(500).json({ error: error.message, message: "Internal Server Error." });
//   }
// };
// // =================================================================
// // 🔥 END OF FIX 🔥
// // =================================================================

// exports.getNewStudents = async (req, res) => {
//   try {
//     const students = await User.find({
//       "admission.admissiondate": {
//         $gte: new Date("2024-01-01"), // Consider passing the date as a query parameter for flexibility
//       },
//       status: {
//         $ne: false // Only new, non-LC students
//       }
//     });
//     return res.status(200).send(students);
//   } catch (error) {
//     console.error("Error fetching new students:", error);
//     return res.status(500).send({ message: "Error fetching new students: " + error.message });
//   }
// };

// exports.getStudentById = async (req, res) => {
//   try {
//     // Standard practice is to get ID from params for GET requests, 
//     // but the original code used req.body. I've updated it to use a unified `id` from body or params.
//     const id = req.body.id || req.params.id; 
    
//     if (!id) {
//       return res.status(400).send({ message: "Please provide student ID" });
//     }
    
//     const data = await User.findById(id);
    
//     if (!data) {
//       return res.status(404).send({ message: "Student not found!" });
//     }
    
//     return res.status(200).send(data);
//   } catch (error) {
//     // If the ID format is invalid (e.g., not a valid MongoDB ObjectId), Mongoose throws a CastError.
//     if (error.name === 'CastError') {
//       return res.status(400).send({ message: "Invalid student ID format." });
//     }
//     console.error("Error in getStudentById:", error);
//     return res.status(500).send({ message: "Server error fetching student by ID", error: error.message });
//   }
// };

// exports.getStudentByStd = async (req, res) => {
//   try {
//     // Using req.query or req.params is generally better for GET filter operations
//     // but sticking to req.body as per the original code.
//     const { standard, division } = req.body;
    
//     if (!standard || !division) {
//       return res
//         .status(400) // Changed from 500 to 400
//         .json({ error: "Standard and Division are required" });
//     }

//     const response = await User.find({
//       "admission.admissionstd": standard,
//       "admission.admissiondivision": division,
//       status: { $ne: false } // Only show active students
//     });
    
//     if (response.length === 0) {
//       return res.status(404).json({ message: "No students found for this Standard and Division." });
//     }

//     return res.status(200).json(response);
//   } catch (error) {
//     console.error("Error fetching students by standard/division:", error); 
    
//     return res.status(500).json({ 
//         error: error.message, 
//         message: "Internal server error during student query." 
//     });
//   }
// };

// exports.editStudent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedData = req.body; 
    
//     // The runValidators: true option ensures Mongoose validation runs on the update
//     const updatedStudent = await User.findByIdAndUpdate(
//       id,
//       updatedData,
//       { new: true, runValidators: true }
//     );
    
//     if (!updatedStudent) {
//       return res.status(404).json({ message: "Student not found" });
//     }
    
//     res.status(200).json({ message: "Student updated successfully", updatedStudent });
//   } catch (error) {
//     console.error("Error updating student:", error);

//     // Specific error handling for Mongoose validation
//     if (error.name === "ValidationError") {
//       return res.status(400).json({
//         message: "Update failed due to validation errors.",
//         errors: error.message, 
//       });
//     }

//     // Specific error handling for Mongoose duplicate unique fields
//     if (error.code && error.code === 11000) {
//       return res.status(409).json({
//         message: "Data conflict: This updated data violates a unique field constraint.",
//       });
//     }
    
//     // General error for invalid ID format
//     if (error.name === 'CastError') {
//       return res.status(400).json({ message: "Invalid student ID format for update." });
//     }
    
//     res.status(500).json({ error: "Internal server error during student update." });
//   }
// };

// // ----------------------------------------------------
// // LC (Leaving Certificate) Endpoints
// // ----------------------------------------------------

// // FIXED: The missing closing curly braces in the original code.
// exports.addLcStudents = async (req, res) => {
//   try {
//     const { studentid } = req.params;
    
//     const newLcStudent = await User.findByIdAndUpdate(
//       studentid,
//       { status: false }, // Set status to false to mark as LC student
//       { new: true }
//     )
    
//     if (!newLcStudent) {
//       return res.status(404).send({ message: 'No student found with this ID!' })
//     }
    
//     // Check if the student was actually set to false (already being an LC student wouldn't hurt)
//     if (newLcStudent.status === false) {
//       return res.status(200).send({ message: 'Student successfully marked for Leaving Certificate (status: false).' })
//     } else {
//       return res.status(200).send({ message: 'Student status updated, but confirmation needed.' })
//     }

//   } catch (error) {
//     console.error(error)
    
//     if (error.name === 'CastError') {
//       return res.status(400).send({ message: "Invalid student ID format." });
//     }

//     return res.status(500).send({
//       message: 'Error while updating LC student status.',
//       error: error.message
//     });
//   }
// };

// exports.getLCStudents = async (req, res) => {
//   try {
//     const lcStudents = await User.find({
//       status: false // Find all students marked with status: false
//     })
    
//     if (lcStudents.length === 0) {
//       return res.status(200).send({ message: 'No LC Students found.' })
//     }
    
//     return res.status(200).send(lcStudents)
//   } catch (error) {
//     console.error("Error In LC students: ", error)
//     return res.status(500).send({ message: "Internal Server Error fetching LC students.", error: error.message })
//   }
// };

// // ----------------------------------------------------
// // Attendance Endpoints
// // ----------------------------------------------------

// exports.addAttendence = async (req, res) => {
//   try {
//     const { std, div, students, date } = req.body;

//     // Improved validation
//     if (!std || !div || !date || !students || !Array.isArray(students) || students.length === 0) {
//       return res.status(400).send({ message: "Please provide complete and valid data for attendance (standard, division, date, and a non-empty array of students)." });
//     }
    
//     // Check if attendance for this date/std/div already exists
//     const existingAttendance = await studentsAttendence.findOne({ std, div, date });
//     if (existingAttendance) {
//         return res.status(409).send({ message: "Attendance for this Standard, Division, and Date has already been recorded." });
//     }

//     const studentsData = new studentsAttendence({
//       std,
//       div,
//       students,
//       date
//     });
//     await studentsData.save();
//     return res.status(201).send({ message: "Students Attendance Added successfully!" });
//   } catch (error) {
//     console.error("Error adding attendance:", error);
//     res.status(500).send({ message: "Internal Server Error during attendance addition!:- " + error.message });
//   }
// };

// exports.getAttendance = async (req, res) => {
//   try {
//     // Recommended to use req.query for GET filters, but maintaining req.body structure
//     const { std, div, date } = req.body;      
    
//     if (!std || !div || !date) {
//       return res.status(400).send({ message: "Please provide complete data (Standard, Division, and Date)!" });
//     }
    
//     const attendance = await studentsAttendence.findOne({
//       std,
//       div,
//       date
//     });
    
//     if (!attendance) {
//       return res.status(404).send({ message: "No attendance found for the specified criteria!" });
//     }

//     return res.status(200).send(attendance);
//   } catch (error) {
//     console.error("Error fetching attendance:", error);
//     return res.status(500).send({ message: "Internal Server Error!:- " + error.message });
//   }
// };

// exports.getAllAttendance = async (req, res) => {
//   try {
//     const attendance = await studentsAttendence.find();
    
//     if (attendance.length === 0) {
//       return res.status(200).send({ message: "No attendance records found." });
//     }
    
//     return res.status(200).send(attendance);
//   } catch (error) {
//     console.error("Error fetching all attendance:", error);
//     return res.status(500).send({ message: "Internal Server Error!:- " + error.message });
//   }
// };

// exports.promoteStudents = async (req, res) => {
//     try {
//         const { studentIds, newStandard, newDivision } = req.body;

//         if (!studentIds || !newStandard || !Array.isArray(studentIds) || studentIds.length === 0) {
//             return res.status(400).json({ message: "Invalid input: studentIds and newStandard are required." });
//         }

//         // Use updateMany to efficiently update all selected students at once
//         const result = await User.updateMany(
//             { studentid: { $in: studentIds } }, // Filter: Find students whose studentid is in the list
//             {
//                 $set: {
//                     "admission.admissionstd": newStandard, // Set the new standard
//                     "admission.admissiondivision": newDivision || "", // Set the new division (optional)
//                     // You might also update the academic year here if necessary
//                 }
//             }
//         );

//         if (result.matchedCount === 0) {
//             return res.status(404).json({ message: "No matching students found to promote." });
//         }

//         return res.status(200).json({
//             message: `${result.modifiedCount} students promoted successfully to Standard ${newStandard}.`,
//             modifiedCount: result.modifiedCount
//         });
//     } catch (error) {
//         console.error("Error during student promotion:", error);
//         return res.status(500).json({ error: error.message, message: "Internal Server Error during promotion." });
//     }
// };


























// const StudentLC = require("../models/StudentLCModel");

// const User = require("../models/studentModel");

// const studentsAttendence = require("../models/studentAttendence");



// // ----------------------------------------------------

// // Student Management Endpoints

// // ----------------------------------------------------



// exports.createUser = async (req, res) => {

// try {

// const user = new User(req.body);

// await user.save();

// // Use 201 for resource creation

// res.status(201).json({ message: "Student created successfully" });

// } catch (error) {

// console.error("Error creating student:", error);



// // Mongoose duplicate unique fields (Code 11000)

// if (error.code && error.code === 11000) {

// // Return 409 Conflict for unique field violations (e.g., duplicate studentid)

// return res.status(409).json({

// message: "Data conflict: A student with this unique ID/number already exists.",

// error: error.message

// });

// }



// // Mongoose validation errors (e.g., missing 'required' field)

// if (error.name === "ValidationError") {

// // Return 400 Bad Request for validation issues

// return res.status(400).json({

// message: "Validation failed. Please check all required fields and data formats.",

// errors: error.message,

// });

// }



// // Fallback for general server errors

// res.status(500).json({ error: error.message, message: "Internal Server Error during student creation." });

// }

// };



// // =================================================================

// // 🔥 FIX APPLIED HERE 🔥: Implement filtering using req.query parameters

// // =================================================================

// exports.getStudents = async (req, res) => {

// try {

// const { std, div, search } = req.query;

// let query = { status: { $ne: false } }; // Start by filtering only active students



// if (std) {

// query["admission.admissionstd"] = std;

// }

// if (div) {

// query["admission.admissiondivision"] = div;

// }


// // Add Search capability: search against firstname, lastname, or student ID

// if (search) {

// const searchRegex = new RegExp(search, "i"); // 'i' for case-insensitive

// query.$or = [

// { "firstname": searchRegex },

// { "lastname": searchRegex },

// // Assuming student ID is stored in the root of the User model or similar field

// { "studentid": searchRegex },

// ];


// // If a standard or division filter is also active, merge them with the search query

// if (std || div) {

// query.$and = [

// { status: { $ne: false } },

// { ...query }, // Includes std and div filters if present

// { $or: query.$or } // Includes the search fields

// ];

// // Clean up: remove the separate $or property and just keep the combined $and

// delete query.$or;

// delete query.status;


// // Re-apply the combined query to the main query object

// query = { $and: query.$and };

// }

// }


// // The final query object is passed to find()

// const students = await User.find(query);



// res.status(200).json(students);

// } catch (error) {

// console.error("Error fetching students:", error);

// res.status(500).json({ error: error.message, message: "Internal Server Error." });

// }

// };

// // =================================================================

// // 🔥 END OF FIX 🔥

// // =================================================================



// exports.getNewStudents = async (req, res) => {

// try {

// const students = await User.find({

// "admission.admissiondate": {

// $gte: new Date("2024-01-01"), // Consider passing the date as a query parameter for flexibility

// },

// status: {

// $ne: false // Only new, non-LC students

// }

// });

// return res.status(200).send(students);

// } catch (error) {

// console.error("Error fetching new students:", error);

// return res.status(500).send({ message: "Error fetching new students: " + error.message });

// }

// };



// exports.getStudentById = async (req, res) => {

// try {

// // Standard practice is to get ID from params for GET requests,

// // but the original code used req.body. I've updated it to use a unified `id` from body or params.

// const id = req.body.id || req.params.id;


// if (!id) {

// return res.status(400).send({ message: "Please provide student ID" });

// }


// const data = await User.findById(id);


// if (!data) {

// return res.status(404).send({ message: "Student not found!" });

// }


// return res.status(200).send(data);

// } catch (error) {

// // If the ID format is invalid (e.g., not a valid MongoDB ObjectId), Mongoose throws a CastError.

// if (error.name === 'CastError') {

// return res.status(400).send({ message: "Invalid student ID format." });

// }

// console.error("Error in getStudentById:", error);

// return res.status(500).send({ message: "Server error fetching student by ID", error: error.message });

// }

// };



// exports.getStudentByStd = async (req, res) => {

// try {

// // Using req.query or req.params is generally better for GET filter operations

// // but sticking to req.body as per the original code.

// const { standard, division } = req.body;


// if (!standard || !division) {

// return res

// .status(400) // Changed from 500 to 400

// .json({ error: "Standard and Division are required" });

// }



// const response = await User.find({

// "admission.admissionstd": standard,

// "admission.admissiondivision": division,

// status: { $ne: false } // Only show active students

// });


// if (response.length === 0) {

// return res.status(404).json({ message: "No students found for this Standard and Division." });

// }



// return res.status(200).json(response);

// } catch (error) {

// console.error("Error fetching students by standard/division:", error);


// return res.status(500).json({

// error: error.message,

// message: "Internal server error during student query."

// });

// }

// };



// exports.editStudent = async (req, res) => {

// try {

// const { id } = req.params;

// const updatedData = req.body;


// // The runValidators: true option ensures Mongoose validation runs on the update

// const updatedStudent = await User.findByIdAndUpdate(

// id,

// updatedData,

// { new: true, runValidators: true }

// );


// if (!updatedStudent) {

// return res.status(404).json({ message: "Student not found" });

// }


// res.status(200).json({ message: "Student updated successfully", updatedStudent });

// } catch (error) {

// console.error("Error updating student:", error);



// // Specific error handling for Mongoose validation

// if (error.name === "ValidationError") {

// return res.status(400).json({

// message: "Update failed due to validation errors.",

// errors: error.message,

// });

// }



// // Specific error handling for Mongoose duplicate unique fields

// if (error.code && error.code === 11000) {

// return res.status(409).json({

// message: "Data conflict: This updated data violates a unique field constraint.",

// });

// }


// // General error for invalid ID format

// if (error.name === 'CastError') {

// return res.status(400).json({ message: "Invalid student ID format for update." });

// }


// res.status(500).json({ error: "Internal server error during student update." });

// }

// };



// // ----------------------------------------------------

// // LC (Leaving Certificate) Endpoints

// // ----------------------------------------------------



// // FIXED: The missing closing curly braces in the original code.

// exports.addLcStudents = async (req, res) => {

// try {

// const { studentid } = req.params;


// const newLcStudent = await User.findByIdAndUpdate(

// studentid,

// { status: false }, // Set status to false to mark as LC student

// { new: true }

// )


// if (!newLcStudent) {

// return res.status(404).send({ message: 'No student found with this ID!' })

// }


// // Check if the student was actually set to false (already being an LC student wouldn't hurt)

// if (newLcStudent.status === false) {

// return res.status(200).send({ message: 'Student successfully marked for Leaving Certificate (status: false).' })

// } else {

// return res.status(200).send({ message: 'Student status updated, but confirmation needed.' })

// }



// } catch (error) {

// console.error(error)


// if (error.name === 'CastError') {

// return res.status(400).send({ message: "Invalid student ID format." });

// }



// return res.status(500).send({

// message: 'Error while updating LC student status.',

// error: error.message

// });

// }

// };



// exports.getLCStudents = async (req, res) => {

// try {

// const lcStudents = await User.find({

// status: false // Find all students marked with status: false

// })


// if (lcStudents.length === 0) {

// return res.status(200).send({ message: 'No LC Students found.' })

// }


// return res.status(200).send(lcStudents)

// } catch (error) {

// console.error("Error In LC students: ", error)

// return res.status(500).send({ message: "Internal Server Error fetching LC students.", error: error.message })

// }

// };



// // ----------------------------------------------------

// // Attendance Endpoints

// // ----------------------------------------------------



// exports.addAttendence = async (req, res) => {

// try {

// const { std, div, students, date } = req.body;



// // Improved validation

// if (!std || !div || !date || !students || !Array.isArray(students) || students.length === 0) {

// return res.status(400).send({ message: "Please provide complete and valid data for attendance (standard, division, date, and a non-empty array of students)." });

// }


// // Check if attendance for this date/std/div already exists

// const existingAttendance = await studentsAttendence.findOne({ std, div, date });

// if (existingAttendance) {

// return res.status(409).send({ message: "Attendance for this Standard, Division, and Date has already been recorded." });

// }



// const studentsData = new studentsAttendence({

// std,

// div,

// students,

// date

// });

// await studentsData.save();

// return res.status(201).send({ message: "Students Attendance Added successfully!" });

// } catch (error) {

// console.error("Error adding attendance:", error);

// res.status(500).send({ message: "Internal Server Error during attendance addition!:- " + error.message });

// }

// };



// exports.getAttendance = async (req, res) => {

// try {

// // Recommended to use req.query for GET filters, but maintaining req.body structure

// const { std, div, date } = req.body;      


// if (!std || !div || !date) {

// return res.status(400).send({ message: "Please provide complete data (Standard, Division, and Date)!" });

// }


// const attendance = await studentsAttendence.findOne({

// std,

// div,

// date

// });


// if (!attendance) {

// return res.status(404).send({ message: "No attendance found for the specified criteria!" });

// }



// return res.status(200).send(attendance);

// } catch (error) {

// console.error("Error fetching attendance:", error);

// return res.status(500).send({ message: "Internal Server Error!:- " + error.message });

// }

// };



// exports.getAllAttendance = async (req, res) => {

// try {

// const attendance = await studentsAttendence.find();


// if (attendance.length === 0) {

// return res.status(200).send({ message: "No attendance records found." });

// }


// return res.status(200).send(attendance);

// } catch (error) {

// console.error("Error fetching all attendance:", error);

// return res.status(500).send({ message: "Internal Server Error!:- " + error.message });

// }

// };



// exports.promoteStudents = async (req, res) => {

// try {

// const { studentIds, newStandard, newDivision } = req.body;



// if (!studentIds || !newStandard || !Array.isArray(studentIds) || studentIds.length === 0) {

// return res.status(400).json({ message: "Invalid input: studentIds and newStandard are required." });

// }



// // Use updateMany to efficiently update all selected students at once

// const result = await User.updateMany(

// { studentid: { $in: studentIds } }, // Filter: Find students whose studentid is in the list

// {

// $set: {

// "admission.admissionstd": newStandard, // Set the new standard

// "admission.admissiondivision": newDivision || "", // Set the new division (optional)

// // You might also update the academic year here if necessary

// }

// }

// );



// if (result.matchedCount === 0) {

// return res.status(404).json({ message: "No matching students found to promote." });

// }



// return res.status(200).json({

// message: `${result.modifiedCount} students promoted successfully to Standard ${newStandard}.`,

// modifiedCount: result.modifiedCount

// });

// } catch (error) {

// console.error("Error during student promotion:", error);

// return res.status(500).json({ error: error.message, message: "Internal Server Error during promotion." });

// }

// };













const StudentLC = require("../models/StudentLCModel");
const User = require("../models/studentModel");
const studentsAttendence = require("../models/studentAttendence");
const nodemailer = require('nodemailer'); 

// ----------------------------------------------------
// Nodemailer Email Sending Utility 
// ----------------------------------------------------

// !! IMPORTANT: Credential placeholders updated with user provided data !!
// REMINDER: #Spreadlove18 must be a Google App Password, not the primary password.
const SENDER_EMAIL = 'mrviplaptop@gmail.com'; 
const APP_PASSWORD = '#Spreadlove18'; // <- REPLACE THIS with the actual Gmail App Password
const SCHOOL_NAME = 'SSPD SMS'; 

/**
 * Sends a confirmation email to the student's parent/guardian.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} firstName - Student's first name.
 * @param {string} admissionNo - The student's login ID.
 * @param {string} birthdate - The student's birthdate (as password).
 */
const sendAdmissionConfirmationEmail = async (toEmail, firstName, admissionNo, birthdate) => {
    // 1. Configure the Transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: SENDER_EMAIL,
            pass: APP_PASSWORD,
        },
        // IMPORTANT: Add detailed logging for connection and authentication attempts
        logger: true,
        debug: true,
    });
    
    // 2. Verify connection settings before attempting to send the email
    try {
        await transporter.verify();
        console.log(`[EMAIL CHECK] SMTP server connection verified for ${SENDER_EMAIL}.`);
    } catch (verifyError) {
        console.error(`[EMAIL FATAL ERROR] SMTP Connection/Authentication Failed:`, verifyError.message);
        console.error(`[EMAIL FATAL ERROR] Check 1: SENDER_EMAIL is correct?`);
        console.error(`[EMAIL FATAL ERROR] Check 2: APP_PASSWORD is correct and is a *Google App Password*?`);
        return; // Stop execution if we can't connect/authenticate
    }
    
    // 3. Define Mail Options
    const mailOptions = {
        from: `"${SCHOOL_NAME} Admission" <${SENDER_EMAIL}>`, 
        to: toEmail,
        subject: `✅ Admission Confirmed - Welcome to ${SCHOOL_NAME}!`, 
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4CAF50;">Dear Parent/Guardian of ${firstName},</h2>
                <p>We are delighted to confirm the successful admission of your child, <strong>${firstName}</strong>, to ${SCHOOL_NAME}.</p>
                <p>Your portal access details are as follows:</p>
                
                <table style="border-collapse: collapse; width: 100%; max-width: 400px; margin: 20px 0; border: 1px solid #ddd;">
                    <tr>
                        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">Login ID (Admission Number)</th>
                        <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; font-weight: bold;">${admissionNo}</td>
                    </tr>
                    <tr>
                        <th style="padding: 10px; text-align: left; background-color: #f2f2f2;">Temporary Password (DOB)</th>
                        <td style="padding: 10px; text-align: left; font-weight: bold;">${birthdate}</td>
                    </tr>
                </table>

                <p style="color: #FF5722;"><strong>Important:</strong> Please log in to the student portal as soon as possible and change your temporary password.</p>
                <p>If you have any questions, please feel free to contact the school administration.</p>
                <p>Best regards,</p>
                <p>The ${SCHOOL_NAME} Administration Team</p>
            </div>
        `,
    };

    // 4. Send the Mail
    try {
        const info = await transporter.sendMail(mailOptions);
        // Success log (as requested)
        console.log(`[EMAIL SUCCESS] Confirmation Email sent to ${toEmail}. Message ID: ${info.messageId}`); 
        console.log(`[EMAIL SUCCESS] Nodemailer Response: ${info.response}`); 
    } catch (error) {
        // Error log for sending failure
        console.error(`[EMAIL SENDING ERROR] Failed to send email for ${firstName}:`, error.message);
    }
};


// ----------------------------------------------------
// Student Management Endpoints (No change to logic flow)
// ----------------------------------------------------

// exports.createUser = async (req, res) => {
//     try {
//         const userData = req.body;
//         const user = new User(userData);
//         await user.save();

//         // Call email function after successful save
//         const toEmail = userData.parent?.emailaddress || userData.emailaddress;
//         const firstName = userData.firstname;
//         const admissionNo = userData.admission?.admissionno || 'N/A'; 
//         const birthdate = userData.dob; 

//         // Send the email in the background (no 'await')
//         if (toEmail && firstName && birthdate) {
//             sendAdmissionConfirmationEmail(toEmail, firstName, admissionNo, birthdate); 
//         } else {
//             console.log(`Admission email skipped for ${firstName}. Missing parent email or DOB in payload.`);
//         }

//         // Use 201 for resource creation
//         res.status(201).json({ message: "Student created successfully" });
//     } catch (error) {
//         console.error("Error creating student:", error);

//         // Mongoose duplicate unique fields (Code 11000)
//         if (error.code && error.code === 11000) {
//             const duplicateKeyMatch = error.message.match(/index: (\w+)_1 dup key: { (.*) }/);
//             const duplicateField = duplicateKeyMatch ? duplicateKeyMatch[1] : "unique ID/number";

//             return res.status(409).json({
//                 message: `Data conflict: A student with this ${duplicateField} already exists.`,
//                 error: error.message
//             });
//         }

//         // Mongoose validation errors (e.g., missing 'required' field)
//         if (error.name === "ValidationError") {
//             return res.status(400).json({
//                 message: "Validation failed. Please check all required fields and data formats.",
//                 errors: error.message,
//             });
//         }

//         // Fallback for general server errors
//         res.status(500).json({ error: error.message, message: "Internal Server Error during student creation." });
//     }
// };
exports.createUser = async (req, res) => {
    try {
        const userData = req.body;

        // --- NEW LOGIC: GENERATE ADM-000 and GR-000 PATTERN ---
        // 1. Get the total count of students currently in the DB
        const studentCount = await User.countDocuments();
        
        // 2. Increment count and pad with leading zeros (e.g., 3 -> "003")
        const nextNumberString = (studentCount + 1).toString().padStart(3, '0');

        // 3. Assign sequential IDs if they weren't provided manually
        if (!userData.admission.admissionno) {
            userData.admission.admissionno = `ADM-${nextNumberString}`;
        }
        if (!userData.admission.grno) {
            userData.admission.grno = `GR-${nextNumberString}`;
        }
        // -----------------------------------------------------

        const user = new User(userData);
        await user.save();

        const toEmail = userData.parent?.emailaddress || userData.emailaddress;
        const firstName = userData.firstname;
        const admissionNo = userData.admission?.admissionno; 
        const birthdate = userData.dob; 

        if (toEmail && firstName && birthdate) {
            sendAdmissionConfirmationEmail(toEmail, firstName, admissionNo, birthdate); 
        } else {
            console.log(`Admission email skipped for ${firstName}. Missing data.`);
        }

        res.status(201).json({ 
            message: "Student created successfully",
            admissionNo: userData.admission.admissionno,
            grNo: userData.admission.grno 
        });
    } catch (error) {
        console.error("Error creating student:", error);
        if (error.code === 11000) {
            return res.status(409).json({ message: `Data conflict: student already exists.` });
        }
        res.status(500).json({ error: error.message, message: "Internal Server Error." });
    }
};


exports.getStudents = async (req, res) => {
    try {
        const { std, div, search } = req.query;
        let query = { status: { $ne: false } }; // Start by filtering only active students

        if (std) {
            query["admission.admissionstd"] = std;
        }
        if (div) {
            query["admission.admissiondivision"] = div;
        }


        // Add Search capability: search against firstname, lastname, or student ID
        if (search) {
            const searchRegex = new RegExp(search, "i"); // 'i' for case-insensitive
            query.$or = [
                { "firstname": searchRegex },
                { "lastname": searchRegex },
                // Assuming student ID is stored in the root of the User model or similar field
                { "studentid": searchRegex },
            ];


            // If a standard or division filter is also active, merge them with the search query
            if (std || div) {
                query.$and = [
                    { status: { $ne: false } },
                    { ...query }, // Includes std and div filters if present
                    { $or: query.$or } // Includes the search fields
                ];
                // Clean up: remove the separate $or property and just keep the combined $and
                delete query.$or;
                delete query.status;


                // Re-apply the combined query to the main query object
                query = { $and: query.$and };
            }
        }


        // The final query object is passed to find()
        const students = await User.find(query);



        res.status(200).json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ error: error.message, message: "Internal Server Error." });
    }
};

exports.getNewStudents = async (req, res) => {
    try {
        const students = await User.find({
            "admission.admissiondate": {
                $gte: new Date("2024-01-01"), // Consider passing the date as a query parameter for flexibility
            },
            status: {
                $ne: false // Only new, non-LC students
            }
        });
        return res.status(200).send(students);
    } catch (error) {
        console.error("Error fetching new students:", error);
        return res.status(500).send({ message: "Error fetching new students: " + error.message });
    }
};



exports.getStudentById = async (req, res) => {
    try {
        // Standard practice is to get ID from params for GET requests,
        // but the original code used req.body. I've updated it to use a unified `id` from body or params.
        const id = req.body.id || req.params.id;


        if (!id) {
            return res.status(400).send({ message: "Please provide student ID" });
        }


        const data = await User.findById(id);


        if (!data) {
            return res.status(404).send({ message: "Student not found!" });
        }


        return res.status(200).send(data);
    } catch (error) {
        // If the ID format is invalid (e.g., not a valid MongoDB ObjectId), Mongoose throws a CastError.
        if (error.name === 'CastError') {
            return res.status(400).send({ message: "Invalid student ID format." });
        }
        console.error("Error in getStudentById:", error);
        return res.status(500).send({ message: "Server error fetching student by ID", error: error.message });
    }
};



exports.getStudentByStd = async (req, res) => {
    try {
        // Using req.query or req.params is generally better for GET filter operations
        // but sticking to req.body as per the original code.
        const { standard, division } = req.body;


        if (!standard || !division) {
            return res
                .status(400) // Changed from 500 to 400
                .json({ error: "Standard and Division are required" });
        }



        const response = await User.find({
            "admission.admissionstd": standard,
            "admission.admissiondivision": division,
            status: { $ne: false } // Only show active students
        });


        if (response.length === 0) {
            return res.status(404).json({ message: "No students found for this Standard and Division." });
        }



        return res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching students by standard/division:", error);


        return res.status(500).json({
            error: error.message,
            message: "Internal server error during student query."
        });
    }
};



exports.editStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;


        // The runValidators: true option ensures Mongoose validation runs on the update
        const updatedStudent = await User.findByIdAndUpdate(
            id,
            updatedData,
            { new: true, runValidators: true }
        );


        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }


        res.status(200).json({ message: "Student updated successfully", updatedStudent });
    } catch (error) {
        console.error("Error updating student:", error);



        // Specific error handling for Mongoose validation
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Update failed due to validation errors.",
                errors: error.message,
            });
        }



        // Specific error handling for Mongoose duplicate unique fields
        if (error.code && error.code === 11000) {
            return res.status(409).json({
                message: "Data conflict: This updated data violates a unique field constraint.",
            });
        }


        // General error for invalid ID format
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid student ID format for update." });
        }


        res.status(500).json({ error: "Internal server error during student update." });
    }
};



// ----------------------------------------------------
// LC (Leaving Certificate) Endpoints
// ----------------------------------------------------



// FIXED: The missing closing curly braces in the original code.
exports.addLcStudents = async (req, res) => {
    try {
        const { studentid } = req.params;


        const newLcStudent = await User.findByIdAndUpdate(
            studentid,
            { status: false }, // Set status to false to mark as LC student
            { new: true }
        )


        if (!newLcStudent) {
            return res.status(404).send({ message: 'No student found with this ID!' })
        }


        // Check if the student was actually set to false (already being an LC student wouldn't hurt)
        if (newLcStudent.status === false) {
            return res.status(200).send({ message: 'Student successfully marked for Leaving Certificate (status: false).' })
        } else {
            return res.status(200).send({ message: 'Student status updated, but confirmation needed.' })
        }



    } catch (error) {
        console.error(error)


        if (error.name === 'CastError') {
            return res.status(400).send({ message: "Invalid student ID format." });
        }



        return res.status(500).send({
            message: 'Error while updating LC student status.',
            error: error.message
        });
    }
};



exports.getLCStudents = async (req, res) => {
    try {
        const lcStudents = await User.find({
            status: false // Find all students marked with status: false
        })


        if (lcStudents.length === 0) {
            return res.status(200).send({ message: 'No LC Students found.' })
        }


        return res.status(200).send(lcStudents)
    } catch (error) {
        console.error("Error In LC students: ", error)
        return res.status(500).send({ message: "Internal Server Error fetching LC students.", error: error.message })
    }
};



// ----------------------------------------------------
// Attendance Endpoints
// ----------------------------------------------------



exports.addAttendence = async (req, res) => {
    try {
        const { std, div, students, date } = req.body;



        // Improved validation
        if (!std || !div || !date || !students || !Array.isArray(students) || students.length === 0) {
            return res.status(400).send({ message: "Please provide complete and valid data for attendance (standard, division, date, and a non-empty array of students)." });
        }


        // Check if attendance for this date/std/div already exists
        const existingAttendance = await studentsAttendence.findOne({ std, div, date });
        if (existingAttendance) {
            return res.status(409).send({ message: "Attendance for this Standard, Division, and Date has already been recorded." });
        }



        const studentsData = new studentsAttendence({
            std,
            div,
            students,
            date
        });
        await studentsData.save();
        return res.status(201).send({ message: "Students Attendance Added successfully!" });
    } catch (error) {
        console.error("Error adding attendance:", error);
        res.status(500).send({ message: "Internal Server Error during attendance addition!:- " + error.message });
    }
};



exports.getAttendance = async (req, res) => {
    try {
        // Recommended to use req.query for GET filters, but maintaining req.body structure
        const { std, div, date } = req.body;


        if (!std || !div || !date) {
            return res.status(400).send({ message: "Please provide complete data (Standard, Division, and Date)!" });
        }


        const attendance = await studentsAttendence.findOne({
            std,
            div,
            date
        });


        if (!attendance) {
            return res.status(404).send({ message: "No attendance found for the specified criteria!" });
        }


        return res.status(200).send(attendance);
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return res.status(500).send({ message: "Internal Server Error!:- " + error.message });
    }
};



exports.getAllAttendance = async (req, res) => {
    try {
        const attendance = await studentsAttendence.find();


        if (attendance.length === 0) {
            return res.status(200).send({ message: "No attendance records found." })
        }


        return res.status(200).send(attendance);
    } catch (error) {
        console.error("Error fetching all attendance:", error);
        return res.status(500).send({ message: "Internal Server Error!:- " + error.message });
    }
};



// exports.promoteStudents = async (req, res) => {
//     try {
//         const { studentIds, newStandard, newDivision } = req.body;



//         if (!studentIds || !newStandard || !Array.isArray(studentIds) || studentIds.length === 0) {
//             return res.status(400).json({ message: "Invalid input: studentIds and newStandard are required." });
//         }



//         // Use updateMany to efficiently update all selected students at once
//         const result = await User.updateMany(
//             { studentid: { $in: studentIds } }, // Filter: Find students whose studentid is in the list
//             {
//                 $set: {
//                     "admission.admissionstd": newStandard, // Set the new standard
//                     "admission.admissiondivision": newDivision || "", // Set the new division (optional)
//                     // You might also update the academic year here if necessary
//                 }
//             }
//         );



//         if (result.matchedCount === 0) {
//             return res.status(404).json({ message: "No matching students found to promote." });
//         }



//         return res.status(200).json({
//             message: `${result.modifiedCount} students promoted successfully to Standard ${newStandard}.`,
//             modifiedCount: result.modifiedCount
//         });
//     } catch (error) {
//         console.error("Error during student promotion:", error);
//         return res.status(500).json({ error: error.message, message: "Internal Server Error during promotion." });
//     }
// };




exports.promoteStudents = async (req, res) => {
    try {
        const { studentIds, newStandard } = req.body; // Removed newDivision from destructuring

        if (!studentIds || !newStandard || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ message: "Invalid input: studentIds and newStandard are required." });
        }

        // Use updateMany to efficiently update all selected students at once
        const result = await User.updateMany(
            { studentid: { $in: studentIds } }, 
            {
                $set: {
                    "admission.admissionstd": newStandard, 
                    // removed admissiondivision to keep the current value in the DB
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "No matching students found to promote." });
        }

        return res.status(200).json({
            message: `${result.modifiedCount} students promoted successfully to Standard ${newStandard}.`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Error during student promotion:", error);
        return res.status(500).json({ error: error.message, message: "Internal Server Error during promotion." });
    }
};
exports.bulkCreateStudents = async (req, res) => {
    try {
        const studentsArray = req.body; // Expecting an array of student objects

        if (!Array.isArray(studentsArray) || studentsArray.length === 0) {
            return res.status(400).json({ message: "Invalid input: Expected an array of students." });
        }

        // 1. Get current count to handle sequential ADM/GR numbers
        let currentCount = await User.countDocuments();

        // 2. Map through the array to add missing IDs and auto-generated fields
        const processedStudents = studentsArray.map((student) => {
            currentCount++;
            const nextID = currentCount.toString().padStart(3, '0');

            // Assign sequential numbers if not provided
            if (!student.admission?.admissionno) {
                student.admission = student.admission || {};
                student.admission.admissionno = `ADM-${nextID}`;
            }
            if (!student.admission?.grno) {
                student.admission.grno = `GR-${nextID}`;
            }

            // Ensure photo is empty as per your requirement
            student.photo = "";
            
            // Set default password if not present
            if (!student.password) {
                student.password = "student@123";
            }

            return student;
        });

        // 3. Bulk Insert into Database
        // ordered: false allows valid documents to be inserted even if some fail (like duplicates)
        const result = await User.insertMany(processedStudents, { ordered: false });

        res.status(201).json({
            message: `${result.length} students registered successfully.`,
            count: result.length
        });

    } catch (error) {
        console.error("Bulk Creation Error:", error);
        
        // Handle partial success/duplicate key errors
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Some students were not added due to duplicate unique fields (ID or Aadhaar).",
                details: error.writeErrors?.length + " duplicates found."
            });
        }

        res.status(500).json({ 
            error: error.message, 
            message: "Internal Server Error during bulk registration." 
        });
    }
};