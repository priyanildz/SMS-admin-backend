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

// File: ../controllers/subjectController.js

const subjectAllocation = require("../models/subjectAllocation");

exports.addSubjectAllot = async (req, res) => {
    try {
        const { teacher, teacherName, subjects, standards, divisions, weeklyLectures } = req.body;

        if (!teacher || !teacherName || !subjects || !standards || !divisions || !weeklyLectures) {
            return res.status(400).json({ message: "Missing required fields." });
        }
        
        // Decompose the request into ATOMIC database entries (one row per S/S/D combination)
        const recordsToSave = [];

        for (const sub of subjects) {
            for (const std of standards) {
                for (const div of divisions) {
                    recordsToSave.push({
                        teacher: teacher, // Expecting the ID here, or handle splitting if combined string is passed
                        teacherName: teacherName,
                        
                        // Save subject, standard, and division as single-item arrays
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
        const response = await subjectAllocation.find();
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// 🚀 NEW FUNCTION TO FIX THE 404/UPDATE ISSUE
exports.updateAllocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { teacher, teacherName, subjects, standards, divisions, weeklyLectures } = req.body;

        // Frontend sends atomic data (single-item arrays) for update
        const updatedFields = {
            // Note: If 'teacher' is passed as "ID,Name" from the frontend, you must split it here:
            // teacher: teacher.split(',')[0], 
            // Assuming the frontend now correctly passes the ID in the 'teacher' field:
            teacher: teacher, 
            teacherName: teacherName,
            subjects: subjects,
            standards: standards,
            divisions: divisions,
            weeklyLectures: weeklyLectures,
        };

        const response = await subjectAllocation.findByIdAndUpdate(
            id,
            updatedFields,
            { new: true, runValidators: true }
        );

        if (!response) {
            return res.status(404).json({ message: "Subject allotment not found." });
        }

        return res
            .status(200)
            .json({ message: "Subject allotment updated successfully", data: response });
    } catch (error) {
        console.error("Error updating subject allotment:", error);
        return res.status(500).json({ error: error.message });
    }
};