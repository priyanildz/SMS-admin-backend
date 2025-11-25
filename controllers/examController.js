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

const mongoose = require("mongoose");
// Import the new result model
const ExamResult = require("../models/ExamResultModel"); 
const examModel = require("../models/examModel"); 

// Helper function to concatenate student name from populated object
const getStudentFullName = (student) => {
    return student && student.firstname && student.lastname 
        ? `${student.firstname} ${student.lastname}` 
        : 'N/A Student';
};

// ... (addETimetable and getETimetable remain the same)

// =================================================================================
// GET EXAM RESULTS (Final working logic using ExamResult Model)
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
    
    // ⭐ CORE FIX: Use ExamResult and populate student name ⭐
    const results = await ExamResult.find(filterQuery)
        .populate({
            path: 'studentId', 
            // Select the name fields from the student model
            select: 'firstname lastname -_id' 
        })
        .lean(); 

    // Map results to flatten the student name and scores for the frontend table
    const mappedResults = results.map(item => {
        const student = item.studentId;
        
        return {
            // 1. Student Name (Required for the first column)
            name: getStudentFullName(student),
            // 2. Dynamically include all other score/subject fields
            // The frontend table will pick up Maths, Science, English, etc.
            ...Object.keys(item).reduce((acc, key) => {
                if (key !== 'studentId' && key !== '__v' && key !== '_id' && key !== 'standard' && key !== 'division' && key !== 'semester') {
                    acc[key] = item[key];
                }
                return acc;
            }, {})
        };
    });

    if (!mappedResults || mappedResults.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(mappedResults);
    
  } catch (error) {
    console.error("Critical Server Error in getExamResults:", error);
    return res.status(500).json({ error: "Failed to fetch exam results due to a server error." });
  }
};