// const examModel = require("../models/examModel");
// exports.addETimetable = async (req, res) => {
//   try {
//     const response = new examModel(req.body);
//     await response.save();
//     return res
//       .status(200)
//       .json({ message: "exam timetable created successfully" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };
// exports.getETimetable = async (req, res) => {
//   try {
//     const response = await examModel.find();
//     return res.status(200).json(response);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };
// exports.getExamResults = async (req, res) => {
//   try {
//     const { standard, division, semester } = req.body;

//     if (!standard || !division || !semester) {
//       return res.status(400).json({ message: "Missing required filters (standard, division, semester)." });
//     }
//     const resultsData = await fetchResultsFromDatabase({ standard, division, semester });

//     if (!resultsData || resultsData.length === 0) {
//       return res.status(200).json([]);
//     }

//     return res.status(200).json(resultsData);
//   } catch (error) {
//     console.error("Error fetching exam results:", error);
//     return res.status(500).json({ error: "Failed to fetch exam results." });
//   }
// };

// const examModel = require("../models/examModel");
// // Assuming you have a separate Mongoose model for storing the final exam results. 
// // We will call this model ExamResultModel for demonstration.
// // You must ensure this model is correctly required and defined in your project.
// // const ExamResultModel = require("../models/ExamResultModel"); 

// // NOTE: Since the context did not provide the specific model name for final results,
// // I am keeping the logic generic. If results are stored in 'examModel', 
// // use 'examModel.find()' below. If results are in a separate model, you must
// // define and require that model (e.g., ExamResultModel).

// exports.addETimetable = async (req, res) => {
//   try {
//     const response = new examModel(req.body);
//     await response.save();
//     return res
//       .status(200)
//       .json({ message: "exam timetable created successfully" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// exports.getETimetable = async (req, res) => {
//   try {
//     const response = await examModel.find();
//     return res.status(200).json(response);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// exports.getExamResults = async (req, res) => {
//   try {
//     const { standard, division, semester } = req.body;

//     if (!standard || !division || !semester) {
//       return res.status(400).json({ message: "Missing required filters (standard, division, semester)." });
//     }

//     // ⭐ CORE LOGIC FIX: Replacing mock logic with actual database query ⭐
    
//     // We assume the data structure for the results is stored in a model 
//     // that contains the student ID, name, standard, division, semester, 
//     // and the subject scores.
    
//     const resultsData = await examModel.find({ // **Use your correct Model here**
//         standard: standard,
//         division: division,
//         semester: semester // Assumes 'semester' field exists in your exam result schema
//     }, 
//     // Projection (optional): Selects the fields you want to return
//     // Adjust this to match your actual schema fields for student name and scores.
//     {
//         _id: 0, // Exclude internal MongoDB ID
//         name: 1, 
//         standard: 1, 
//         division: 1, 
//         semester: 1,
//         Maths: 1, // Example subject 1
//         Science: 1, // Example subject 2
//         English: 1
//     }).lean(); // .lean() makes the result a plain JavaScript object for faster queries

//     // --------------------------------------------------------------------------

//     if (!resultsData || resultsData.length === 0) {
//       // Return an empty array if no results are found
//       return res.status(200).json([]);
//     }

//     // The resultsData array now contains the student objects ready to be sent to the client.
//     return res.status(200).json(resultsData);
    
//   } catch (error) {
//     // Log the detailed error on the server side for debugging
//     console.error("Critical Server Error in getExamResults:", error);
    
//     // Return a generic error message to the client
//     return res.status(500).json({ error: "Failed to fetch exam results due to a server error." });
//   }
// };


// examController.js
// examController.js

// const mongoose = require("mongoose");
// const examModel = require("../models/examModel"); 
// // 1. IMPORT DEDICATED RESULT MODEL
// const ExamResult = require("../models/examResult");
// // 2. IMPORT STUDENT MODEL for name lookup
// const Student = mongoose.model('student'); 


// // Helper function to concatenate student name from populated object
// const getStudentFullName = (student) => {
//     return student && student.firstname && student.lastname 
//         ? `${student.firstname} ${student.lastname}` 
//         : 'N/A Student';
// };

// // =================================================================================
// // ADD EXAM RESULTS (Handles POST to /save-exam-result)
// // =================================================================================
// exports.addExamResults = async (req, res) => {
//     const resultsToSave = Array.isArray(req.body) ? req.body : [req.body];
    
//     if (resultsToSave.length === 0) {
//         return res.status(400).json({ error: "No data provided to save." });
//     }

//     try {
//         // Save records directly to the dedicated ExamResult collection
//         const savedResults = await ExamResult.insertMany(resultsToSave); 

//         return res.status(200).json({ 
//             message: "Exam results saved successfully.", 
//             count: savedResults.length 
//         });
//     } catch (error) {
//         console.error("Error saving exam results:", error);
//         return res.status(500).json({ error: error.message, detail: "Ensure studentId is a valid ObjectId." });
//     }
// };


// // =================================================================================
// // GET EXAM RESULTS (Handles POST to /exam-results)
// // =================================================================================

// exports.getExamResults = async (req, res) => {
//     try {
//         const { standard, division, semester } = req.body;

//         if (!standard || !division || !semester) {
//             return res.status(400).json({ message: "Missing required filters (standard, division, semester)." });
//         }

//         const filterQuery = {
//             standard: standard,
//             division: division,
//             semester: semester 
//         };
//     
//         // Fetch results and populate the linked Student data
//         const results = await ExamResult.find(filterQuery)
//             .populate({
//                 path: 'studentId', 
//                 select: 'firstname lastname -_id', 
//                 // CRITICAL STABILITY FIX
//                 match: { _id: { $ne: null } }
//             })
//             .lean(); 

//         // Map results to flatten the data
//         const mappedResults = results
//             .filter(item => item.studentId) 
//             .map(item => {
//                 const student = item.studentId;
                
//                 return {
//                     name: getStudentFullName(student),
                    
//                     // Include all other score fields dynamically
//                     ...Object.keys(item).reduce((acc, key) => {
//                         if (key !== 'studentId' && key !== '__v' && key !== '_id' && key !== 'standard' && key !== 'division' && key !== 'semester' && key !== 'createdAt' && key !== 'updatedAt') {
//                             acc[key] = item[key];
//                         }
//                         return acc;
//                     }, {})
//                 };
//             });

//         if (mappedResults.length === 0) {
//             return res.status(200).json([]);
//         }

//         return res.status(200).json(mappedResults);
//     
//     } catch (error) {
//         console.error("CRITICAL SERVER ERROR IN GET EXAM RESULTS:", error);
//         return res.status(500).json({ error: "Server failed to process query/population." });
//     }
// };

// // =================================================================================
// // 3. EXAM TIMETABLE FUNCTIONS (Existing - kept as is)
// // =================================================================================

// exports.addETimetable = async (req, res) => {
//   try {
//     const response = new examModel(req.body);
//     await response.save();
//     return res
//       .status(200)
//       .json({ message: "exam timetable created successfully" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// exports.getETimetable = async (req, res) => {
//   try {
//     const response = await examModel.find();
//     return res.status(200).json(response);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };




const mongoose = require("mongoose");
const examModel = require("../models/examModel"); 
// 1. IMPORT DEDICATED RESULT MODEL
const ExamResult = require("../models/examResult");
// 2. IMPORT STUDENT MODEL for name lookup
const Student = mongoose.model('student'); 


// Helper function to concatenate student name from populated object
const getStudentFullName = (student) => {
    return student && student.firstname && student.lastname 
        ? `${student.firstname} ${student.lastname}` 
        : 'N/A Student';
};

// =================================================================================
// ADD EXAM RESULTS (Handles POST to /save-exam-result)
// =================================================================================
exports.addExamResults = async (req, res) => {
    const resultsToSave = Array.isArray(req.body) ? req.body : [req.body];
    
    if (resultsToSave.length === 0) {
        return res.status(400).json({ error: "No data provided to save." });
    }

    try {
        // Save records directly to the dedicated ExamResult collection
        const savedResults = await ExamResult.insertMany(resultsToSave); 

        return res.status(200).json({ 
            message: "Exam results saved successfully.", 
            count: savedResults.length 
        });
    } catch (error) {
        console.error("Error saving exam results:", error);
        return res.status(500).json({ error: error.message, detail: "Ensure studentId is a valid ObjectId." });
    }
};


// =================================================================================
// GET EXAM RESULTS (Handles POST to /exam-results)
// =================================================================================

exports.getExamResults = async (req, res) => {
    try {
        const { standard, division, semester } = req.body;

        if (!standard || !division || !semester) {
            return res.status(400).json({ message: "Missing required filters (standard, division, semester)." });
        }

        const filterQuery = {
            standard: standard,
            division: division,
            semester: semester 
        };
    
        // Fetch results and populate the linked Student data
        const results = await ExamResult.find(filterQuery)
            .populate({
                path: 'studentId', 
                select: 'firstname lastname -_id', 
                // CRITICAL STABILITY FIX
                match: { _id: { $ne: null } }
            })
            .lean(); 

        // Map results to flatten the data
        const mappedResults = results
            .filter(item => item.studentId) 
            .map(item => {
                const student = item.studentId;
                
                return {
                    name: getStudentFullName(student),
                    
                    // Include all other score fields dynamically
                    ...Object.keys(item).reduce((acc, key) => {
                        if (key !== 'studentId' && key !== '__v' && key !== '_id' && key !== 'standard' && key !== 'division' && key !== 'semester' && key !== 'createdAt' && key !== 'updatedAt') {
                            acc[key] = item[key];
                        }
                        return acc;
                    }, {})
                };
            });

        if (mappedResults.length === 0) {
            return res.status(200).json([]);
        }

        return res.status(200).json(mappedResults);
    
    } catch (error) {
        console.error("CRITICAL SERVER ERROR IN GET EXAM RESULTS:", error);
        return res.status(500).json({ error: "Server failed to process query/population." });
    }
};

// =================================================================================
// 3. EXAM TIMETABLE FUNCTIONS 
// =================================================================================

exports.addETimetable = async (req, res) => {
    const { standard, examtype } = req.body;
    
    try {
        // Pre-check for existing record to provide a cleaner error message
        const existingTimetable = await examModel.findOne({ standard, examtype });
        if (existingTimetable) {
            // UPDATED: Standardized conflict notification message
            return res.status(409).json({ 
                message: `A timetable for Standard ${standard} and Exam Type '${examtype}' already exists.`,
                error: true,
                code: 409
            });
        }
        
        const response = new examModel(req.body);
        await response.save();
        return res
          .status(200)
          .json({ 
            message: "Exam timetable created successfully",
            error: false 
        });
        
    } catch (error) {
        // Handle MongoDB Duplicate Key Error (Code 11000) explicitly if the pre-check fails
        if (error.code === 11000) {
            // UPDATED: Standardized conflict notification message
            return res.status(409).json({ 
                message: `Conflict: A timetable for Standard ${standard} and Exam Type '${examtype}' already exists (DB Enforced).`,
                error: true,
                code: 409
            });
        }
        
        return res.status(500).json({ 
            message: "An unexpected error occurred while creating the timetable.", 
            error: error.message,
            code: 500
        });
    }
};

exports.getETimetable = async (req, res) => {
  try {
    const response = await examModel.find();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};