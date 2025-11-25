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
const examModel = require("../models/examModel"); // For exam timetable related functions
// ⭐ ASSUMPTION: You have a separate Mongoose model for storing FINAL Exam Results.
// You must ensure this model is correctly defined and imported. 
// We use mongoose.model('ExamResult') as a placeholder for your actual result model.
const ExamResult = mongoose.model('ExamResult'); // Replace 'ExamResult' with your actual model name for results

// Helper function to concatenate student name from populated object
const getStudentFullName = (student) => {
    return student && student.firstname && student.lastname 
        ? `${student.firstname} ${student.lastname}` 
        : 'N/A Student';
};

// =================================================================================
// 1. EXAM TIMETABLE FUNCTIONS (Existing - kept for completeness)
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
// 2. GET EXAM RESULTS (New Functionality: Filter and Populate Student Data)
// =================================================================================

exports.getExamResults = async (req, res) => {
  try {
    // Filters are sent via POST request body from the frontend
    const { standard, division, semester } = req.body;

    if (!standard || !division || !semester) {
      return res.status(400).json({ message: "Missing required filters (standard, division, semester)." });
    }

    // Build the main query filter
    const filterQuery = {
        standard: standard,
        division: division,
        semester: semester // Assumes 'semester' field exists in your ExamResult model
    };
    
    // Fetch results and populate the linked Student data
    const results = await ExamResult.find(filterQuery)
        .populate({
            path: 'studentId', // The field in ExamResult storing the Student ObjectId
            select: 'firstname lastname -_id' // Fetch only name fields from the Student model
        })
        .lean(); // Use .lean() for better performance

    // Map results to combine fields for frontend consumption
    const mappedResults = results.map(item => {
        const student = item.studentId;
        
        // Dynamically create the final object sent to the frontend
        const finalResult = {
            // 1. Flattened Name (Required for the frontend table structure)
            name: getStudentFullName(student),
            // 2. Include all other fields (subject scores, etc.) from the result document
            // This safely excludes the studentId and other internal fields, leaving the scores
            ...Object.keys(item).reduce((acc, key) => {
                if (key !== 'studentId' && key !== '__v' && key !== '_id') {
                    acc[key] = item[key];
                }
                return acc;
            }, {})
        };
        
        return finalResult;
    });

    return res.status(200).json(mappedResults);
    
  } catch (error) {
    console.error("Critical Server Error in getExamResults:", error);
    
    // Return a generic error message to the client
    return res.status(500).json({ error: "Failed to fetch exam results due to a server error." });
  }
};