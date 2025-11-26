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

const mongoose = require("mongoose");
const examModel = require("../models/examModel"); 
const TermAssessment = require("../models/termAssessment"); // Model that holds scores/studentData
const Student = mongoose.model('student'); 
// NOTE: Ensure your student model is globally available or correctly required in this file.


// Helper function to concatenate student name from populated object
const getStudentFullName = (student) => {
    return student && student.firstname && student.lastname 
        ? `${student.firstname} ${student.lastname}` 
        : 'N/A Student';
};

// =================================================================================
// ADD EXAM RESULTS (New Function)
// =================================================================================
exports.addExamResults = async (req, res) => {
    // Allows saving a single object or an array of objects to TermAssessment
    const resultsToSave = Array.isArray(req.body) ? req.body : [req.body];
    
    if (resultsToSave.length === 0) {
        return res.status(400).json({ error: "No data provided to save." });
    }

    try {
        // We assume the data structure being posted is a simplified score object 
        // that matches the TermAssessment model fields (e.g., standard, division, studentData).
        // Since TermAssessment is designed for *assessment* records (not individual student scores),
        // we'll save it directly, assuming the client provides the full TermAssessment object.
        
        // This logic is safer: it saves records exactly as they are sent.
        const savedResults = await TermAssessment.insertMany(resultsToSave); 

        return res.status(200).json({ 
            message: "Exam results saved successfully to TermAssessment collection.", 
            count: savedResults.length 
        });
    } catch (error) {
        console.error("Error saving exam results:", error);
        return res.status(500).json({ error: error.message });
    }
};


// =================================================================================
// EXAM TIMETABLE FUNCTIONS (Kept as is)
// =================================================================================

exports.addETimetable = async (req, res) => {
  try {
    const response = new examModel(req.body);
    await response.save();
    return res
      .status(200)
      .json({ message: "exam timetable created successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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

// =================================================================================
// GET EXAM RESULTS (Retrieval logic)
// =================================================================================

exports.getExamResults = async (req, res) => {
  try {
    // Filters sent from the frontend ExamResults page
    const { standard, division, semester } = req.body; 

    if (!standard || !division || !semester) {
      return res.status(400).json({ message: "Missing required filters (standard, division, semester)." });
    }
    
    const filterQuery = {
        standard: standard,
        division: division,
        // If TermAssessment gets a 'semester' field, uncomment this:
        // semester: semester 
    };

    // Find the Term Assessment record(s) matching the class filters
    const termRecords = await TermAssessment.find(filterQuery).lean(); 

    if (!termRecords || termRecords.length === 0) {
      return res.status(200).json([]);
    }

    // --- Aggregating and Flattening Student Results ---
    const allStudentResults = {};

    for (const record of termRecords) {
        // Assumes studentData: { studentId1: { subject1: score }, ... }

        for (const [studentMongoId, scores] of Object.entries(record.studentData)) {
            if (!allStudentResults[studentMongoId]) {
                allStudentResults[studentMongoId] = { studentId: studentMongoId, ...scores };
            } else {
                allStudentResults[studentMongoId] = { 
                    ...allStudentResults[studentMongoId], 
                    ...scores 
                };
            }
        }
    }
    
    const studentIds = Object.keys(allStudentResults);

    if (studentIds.length === 0) {
        return res.status(200).json([]);
    }

    // 1. Fetch all student details (names) based on collected IDs
    const students = await Student.find({ _id: { $in: studentIds } }).lean();
    
    const studentMap = students.reduce((acc, student) => {
        acc[student._id.toString()] = student;
        return acc;
    }, {});
    
    // 2. Final mapping to frontend format
    const finalResults = studentIds.map(id => {
        const studentDetails = studentMap[id];
        const scores = allStudentResults[id];

        return {
            name: studentDetails ? getStudentFullName(studentDetails) : `Student ${id}`,
            ...scores
        };
    });
    
    return res.status(200).json(finalResults);
    
  } catch (error) {
    console.error("Critical Server Error in getExamResults:", error);
    return res.status(500).json({ error: "Failed to fetch exam results. Please ensure the TermAssessment data structure is correct and student IDs are valid.", detail: error.message });
  }
};