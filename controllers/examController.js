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