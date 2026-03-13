// const report = require("../models/reportModel");
// exports.addReport = async (req, res) => {
//   try {
//     const response = new report(req.body);
//     await response.save();
//     return res.status(200).json({ message: "added report card" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };
// exports.getReport = async (req, res) => {
//   try {
//     const response = await report.find();
//     return res.status(200).json(response);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };



// // --- In your reportController.js file ---
// const report = require("../models/reportModel");
// const Student = require("../models/studentModel"); // 💡 ASSUMPTION: You have a Student model import

// exports.addReport = async (req, res) => {
//   try {
//     const response = new report(req.body);
//     await response.save();
//     return res.status(200).json({ message: "added report card" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// exports.getReport = async (req, res) => {
//     try {
//         // 1. Fetch all report documents
//         const reports = await report.find();

//         // 2. Extract all unique student IDs (rollno)
//         const studentIds = reports.map(r => r.rollno);
        
//         // 3. Find all corresponding student documents
//         // We look up students by their Mongoose '_id', which matches the 'rollno' in the report schema
//         const students = await Student.find({ _id: { $in: studentIds } });

//         // Create a map for quick lookup: { studentId: fullName }
//         const studentNameMap = students.reduce((acc, student) => {
//             const fullName = `${student.firstname} ${student.lastname}`;
//             acc[student._id.toString()] = fullName;
//             return acc;
//         }, {});

//         // 4. Combine report data with the actual current student name
//         const combinedReports = reports.map(r => {
//             const studentId = r.rollno.toString();
//             const studentName = studentNameMap[studentId] || r.name; // Fallback to name in report doc
            
//             return {
//                 ...r.toObject(), // Convert Mongoose document to plain object
//                 name: studentName, // Overwrite the name with the current full name
//             };
//         });

//         return res.status(200).json(combinedReports);
//     } catch (error) {
//         console.error("Error fetching reports with names:", error);
//         return res.status(500).json({ error: error.message });
//     }
// };


const ExamResult = require("../models/examResultModel"); // Assuming this is your model name
const Student = require("../models/studentModel");

exports.getExamResults = async (req, res) => {
  try {
    const { standard, division, semester } = req.body;

    // 1. Fetch all documents matching the filters (multiple subjects)
    // We use a regex for semester to handle "1" vs "Sem 1" or "Semester 1"
    const resultDocs = await ExamResult.find({
      standard: standard,
      division: division,
      semester: new RegExp(semester, "i"), 
    });

    if (!resultDocs || resultDocs.length === 0) {
      return res.status(200).json([]);
    }

    // 2. Extract all unique student IDs from all subject results
    const allStudentIds = new Set();
    resultDocs.forEach((doc) => {
      doc.results.forEach((res) => {
        if (res.studentId) allStudentIds.add(res.studentId.toString());
      });
    });

    // 3. Fetch Student Names for these IDs
    const students = await Student.find({
      _id: { $in: Array.from(allStudentIds) },
    });

    const studentMap = students.reduce((acc, s) => {
      acc[s._id.toString()] = `${s.firstname} ${s.lastname}`;
      return acc;
    }, {});

    // 4. Transform data: Group by Student ID
    // Final structure: { "studentId": { name: "Name", Math: 50, English: 60 } }
    const groupedData = {};

    resultDocs.forEach((doc) => {
      const subjectName = doc.subject;
      doc.results.forEach((res) => {
        const sId = res.studentId.toString();
        
        if (!groupedData[sId]) {
          groupedData[sId] = {
            id: sId,
            name: studentMap[sId] || "Unknown Student",
          };
        }
        
        // Add the marks for this specific subject
        // Convert string marks to Number for the frontend calculations
        groupedData[sId][subjectName] = res.marks === "" ? 0 : Number(res.marks);
      });
    });

    // 5. Convert object back to array for frontend
    const finalResponse = Object.values(groupedData);

    return res.status(200).json(finalResponse);
  } catch (error) {
    console.error("Error in getExamResults:", error);
    return res.status(500).json({ error: error.message });
  }
};