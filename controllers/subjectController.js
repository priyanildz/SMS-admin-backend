// const subjectAllocation = require("../models/subjectAllocation");
// exports.addSubjectAllot = async (req, res) => {
//   try {
//     const response = new subjectAllocation(req.body);
//     await response.save();
//     return res
//       .status(200)
//       .json({ message: "subject allotment done successfully" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };
// exports.getAllocations = async (req, res) => {
//   try {
//     const response = await subjectAllocation.find();
//     return res.status(200).json(response);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// File: ../controllers/subjectController.js (Updated Logic)

const subjectAllocation = require("../models/subjectAllocation");

exports.addSubjectAllot = async (req, res) => {
    try {
        const { teacher, teacherName, subjects, standards, divisions, weeklyLectures, teacherIdName } = req.body;

        if (!teacher || !teacherName || !subjects || !standards || !divisions || !weeklyLectures) {
            return res.status(400).json({ message: "Missing required fields." });
        }
        
        // 🚀 CRUCIAL CHANGE: Decompose the request into ATOMIC database entries
        const recordsToSave = [];

        // Assuming subjects, standards, and divisions are arrays from the frontend
        for (const sub of subjects) {
            for (const std of standards) {
                // The divisions array now contains the specific divisions for this standard/subject combination
                for (const div of divisions) {
                    recordsToSave.push({
                        // teacher and teacherName are single values
                        teacher: teacher.split(',')[0], // Extract ID if needed, or pass pure ID from frontend
                        teacherName: teacherName,
                        
                        // Save subject, standard, and division as single-item arrays
                        // to match the Mongoose schema: type: [String]
                        subjects: [sub],
                        standards: [std],
                        divisions: [div],
                        weeklyLectures: weeklyLectures,
                    });
                }
            }
        }

        if (recordsToSave.length === 0) {
            return res.status(400).json({ message: "No valid assignments found to save." });
        }

        // Save all decomposed records at once
        await subjectAllocation.insertMany(recordsToSave);

        return res
            .status(200)
            .json({ message: "Subject allotments done successfully (Atomic save)." });
    } catch (error) {
        console.error("Error saving subject allotments:", error);
        return res.status(500).json({ error: error.message });
    }
};

exports.getAllocations = async (req, res) => {
    try {
        // Since we are now saving atomic records, simply returning the find result works perfectly.
        const response = await subjectAllocation.find();
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};