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

// File: ../controllers/subjectController.js

const subjectAllocation = require("../models/subjectAllocation");

// --- 1. ADD/DECOMPOSE ALLOCATION (POST /allot-subject) ---
exports.addSubjectAllot = async (req, res) => {
    try {
        const { teacher, teacherName, subjects, standards, divisions, weeklyLectures } = req.body;

        if (!teacher || !teacherName || !subjects || !standards || !divisions || !weeklyLectures) {
            return res.status(400).json({ message: "Missing required fields." });
        }
        
        // Decompose the request into ATOMIC database entries
        const recordsToSave = [];

        for (const sub of subjects) {
            for (const std of standards) {
                for (const div of divisions) {
                    recordsToSave.push({
                        // Assuming 'teacher' is the Mongoose ID passed from the frontend
                        teacher: teacher, 
                        teacherName: teacherName,
                        
                        // Save subject, standard, and division as single-item arrays to match the Mongoose schema
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

// --- 2. GET ALL ALLOCATIONS (GET /allotments) ---
exports.getAllocations = async (req, res) => {
    try {
        const response = await subjectAllocation.find();
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// --- 3. UPDATE SINGLE ALLOCATION (PUT /allotments/:id) ---
exports.updateAllocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { teacher, teacherName, subjects, standards, divisions, weeklyLectures } = req.body;

        const updatedFields = {
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

// --- 4. DELETE SINGLE ALLOCATION (DELETE /allotments/:id) ---
exports.deleteAllocation = async (req, res) => {
    try {
        const { id } = req.params;
        
        const response = await subjectAllocation.findByIdAndDelete(id);

        if (!response) {
            // Returns a 404 if the record wasn't found, although the router should catch a missing route first
            return res.status(404).json({ message: "Subject allotment not found." });
        }

        return res
            .status(200)
            .json({ message: "Subject allotment deleted successfully", data: response });
    } catch (error) {
        console.error("Error deleting subject allotment:", error);
        return res.status(500).json({ error: error.message });
    }
};