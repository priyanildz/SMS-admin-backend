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



// --- In your reportController.js file ---
const report = require("../models/reportModel");
const Student = require("../models/studentModel"); // 💡 ASSUMPTION: You have a Student model import

exports.addReport = async (req, res) => {
    // ... (existing addReport function)
};

exports.getReport = async (req, res) => {
    try {
        // 1. Fetch all report documents
        const reports = await report.find();

        // 2. Extract all unique student IDs (rollno)
        const studentIds = reports.map(r => r.rollno);
        
        // 3. Find all corresponding student documents
        // We look up students by their Mongoose '_id', which matches the 'rollno' in the report schema
        const students = await Student.find({ _id: { $in: studentIds } });

        // Create a map for quick lookup: { studentId: fullName }
        const studentNameMap = students.reduce((acc, student) => {
            const fullName = `${student.firstname} ${student.lastname}`;
            acc[student._id.toString()] = fullName;
            return acc;
        }, {});

        // 4. Combine report data with the actual current student name
        const combinedReports = reports.map(r => {
            const studentId = r.rollno.toString();
            const studentName = studentNameMap[studentId] || r.name; // Fallback to name in report doc
            
            return {
                ...r.toObject(), // Convert Mongoose document to plain object
                name: studentName, // Overwrite the name with the current full name
            };
        });

        return res.status(200).json(combinedReports);
    } catch (error) {
        console.error("Error fetching reports with names:", error);
        return res.status(500).json({ error: error.message });
    }
};