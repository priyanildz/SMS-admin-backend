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

// const subjectAllocation = require("../models/subjectAllocation");

// // --- 1. ADD/DECOMPOSE ALLOCATION (POST /allot-subject) ---
// exports.addSubjectAllot = async (req, res) => {
//     try {
//         const { teacher, teacherName, subjects, standards, divisions, weeklyLectures } = req.body;

//         if (!teacher || !teacherName || !subjects || !standards || !divisions || !weeklyLectures) {
//             return res.status(400).json({ message: "Missing required fields." });
//         }
        
//         // Decompose the request into ATOMIC database entries
//         const recordsToSave = [];

//         for (const sub of subjects) {
//             for (const std of standards) {
//                 for (const div of divisions) {
//                     recordsToSave.push({
//                         // Assuming 'teacher' is the Mongoose ID passed from the frontend
//                         teacher: teacher, 
//                         teacherName: teacherName,
                        
//                         // Save subject, standard, and division as single-item arrays to match the Mongoose schema
//                         subjects: [sub],
//                         standards: [std],
//                         divisions: [div],
//                         weeklyLectures: weeklyLectures,
//                     });
//                 }
//             }
//         }

//         if (recordsToSave.length === 0) {
//             return res.status(400).json({ message: "No valid assignments found to save." });
//         }

//         await subjectAllocation.insertMany(recordsToSave);

//         return res
//             .status(200)
//             .json({ message: "Subject allotments done successfully (Atomic save)." });
//     } catch (error) {
//         console.error("Error saving subject allotments:", error);
//         return res.status(500).json({ error: error.message });
//     }
// };

// // --- 2. GET ALL ALLOCATIONS (GET /allotments) ---
// exports.getAllocations = async (req, res) => {
//     try {
//         const response = await subjectAllocation.find();
//         return res.status(200).json(response);
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

// // --- 3. UPDATE SINGLE ALLOCATION (PUT /allotments/:id) ---
// exports.updateAllocation = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { teacher, teacherName, subjects, standards, divisions, weeklyLectures } = req.body;

//         const updatedFields = {
//             teacher: teacher, 
//             teacherName: teacherName,
//             subjects: subjects,
//             standards: standards,
//             divisions: divisions,
//             weeklyLectures: weeklyLectures,
//         };

//         const response = await subjectAllocation.findByIdAndUpdate(
//             id,
//             updatedFields,
//             { new: true, runValidators: true }
//         );

//         if (!response) {
//             return res.status(404).json({ message: "Subject allotment not found." });
//         }

//         return res
//             .status(200)
//             .json({ message: "Subject allotment updated successfully", data: response });
//     } catch (error) {
//         console.error("Error updating subject allotment:", error);
//         return res.status(500).json({ error: error.message });
//     }
// };

// // --- 4. DELETE SINGLE ALLOCATION (DELETE /allotments/:id) ---
// exports.deleteAllocation = async (req, res) => {
//     try {
//         const { id } = req.params;
        
//         const response = await subjectAllocation.findByIdAndDelete(id);

//         if (!response) {
//             // Returns a 404 if the record wasn't found, although the router should catch a missing route first
//             return res.status(404).json({ message: "Subject allotment not found." });
//         }

//         return res
//             .status(200)
//             .json({ message: "Subject allotment deleted successfully", data: response });
//     } catch (error) {
//         console.error("Error deleting subject allotment:", error);
//         return res.status(500).json({ error: error.message });
//     }
// };








const subjectAllocation = require("../models/subjectAllocation");
const Subject = require("../models/subjectsModel"); // Ensure this model path is correct for your project
const staffRole = require("../models/staffRole");

// --- 1. ADD/DECOMPOSE ALLOCATION (POST /allot-subject) ---
// exports.addSubjectAllot = async (req, res) => {
//     try {
//         const { teacher, teacherName, subjects, standards, divisions, weeklyLectures } = req.body;

//         if (!teacher || !teacherName || !subjects || !standards || !divisions || !weeklyLectures) {
//             return res.status(400).json({ message: "Missing required fields." });
//         }
        
//         // --- 🚀 NEW LOGIC: AUTOMATICALLY CREATE/UPDATE SUBJECT LIST ---
//         for (const std of standards) {
//             // Find existing subject list for this standard
//             let existingSubjectList = await Subject.findOne({ standard: std.toString() });

//             if (existingSubjectList) {
//                 // If standard exists, add any new subjects to its list if they aren't already there
//                 const newSubjectsToAdd = subjects.filter(sub => !existingSubjectList.subjectname.includes(sub));
//                 if (newSubjectsToAdd.length > 0) {
//                     existingSubjectList.subjectname.push(...newSubjectsToAdd);
//                     await existingSubjectList.save();
//                 }
//             } else {
//                 // If standard doesn't exist, create a new master subject list for it
//                 const newSubjectRecord = new Subject({
//                     standard: std.toString(),
//                     subjectname: subjects
//                 });
//                 await newSubjectRecord.save();
//             }
//         }
//         // --- END OF NEW LOGIC ---

//         // Decompose the request into ATOMIC database entries
//         const recordsToSave = [];

//         for (const sub of subjects) {
//             for (const std of standards) {
//                 for (const div of divisions) {
//                     recordsToSave.push({
//                         teacher: teacher, 
//                         teacherName: teacherName,
//                         subjects: [sub],
//                         standards: [std],
//                         divisions: [div],
//                         weeklyLectures: weeklyLectures,
//                     });
//                 }
//             }
//         }

//         if (recordsToSave.length === 0) {
//             return res.status(400).json({ message: "No valid assignments found to save." });
//         }

//         await subjectAllocation.insertMany(recordsToSave);

//         return res
//             .status(200)
//             .json({ message: "Subject allotment and master subject list updated successfully." });
//     } catch (error) {
//         console.error("Error saving subject allotments:", error);
//         return res.status(500).json({ error: error.message });
//     }
// };
// exports.addSubjectAllot = async (req, res) => {
//     try {
//         const { teacher, teacherName, subjects, standards, divisions, weeklyLectures, staffid } = req.body;

//         if (!teacher || !teacherName || !subjects || !standards || !divisions || !weeklyLectures) {
//             return res.status(400).json({ message: "Missing required fields." });
//         }

//         // --- 🛡️ CATEGORY VALIDATION LOGIC ---
//         // Fetch the teacher's registered categories
//         const roleData = await staffRole.findOne({ staffid: staffid });
        
//         if (roleData) {
//             const preferred = roleData.preferredgrades; // This will be ["pre-primary"], ["primary"], etc.
            
//             // Define the mapping rules
//             const gradeMapping = {
//                 "pre-primary": ["nursery", "junior", "senior"],
//                 "primary": ["1", "2", "3", "4", "5"],
//                 "secondary": ["6", "7", "8", "9", "10"]
//             };

//             // Check every standard being assigned
//             for (const std of standards) {
//                 let isAllowed = false;
                
//                 // A teacher can have multiple categories (though currently single-select in UI)
//                 preferred.forEach(cat => {
//                     const normalizedCat = cat.toLowerCase();
//                     const normalizedStd = std.toString().toLowerCase();
                    
//                     if (gradeMapping[normalizedCat] && gradeMapping[normalizedCat].includes(normalizedStd)) {
//                         isAllowed = true;
//                     }
//                 });

//                 if (!isAllowed) {
//                     return res.status(403).json({ 
//                         message: `Validation Failed: ${teacherName} is registered for ${preferred.join(", ")} and cannot be allotted to Standard ${std}.` 
//                     });
//                 }
//             }
//         }
//         // --- END OF VALIDATION ---

//         // --- 🚀 AUTOMATICALLY CREATE/UPDATE SUBJECT LIST ---
//         for (const std of standards) {
//             let existingSubjectList = await Subject.findOne({ standard: std.toString() });

//             if (existingSubjectList) {
//                 const newSubjectsToAdd = subjects.filter(sub => !existingSubjectList.subjectname.includes(sub));
//                 if (newSubjectsToAdd.length > 0) {
//                     existingSubjectList.subjectname.push(...newSubjectsToAdd);
//                     await existingSubjectList.save();
//                 }
//             } else {
//                 const newSubjectRecord = new Subject({
//                     standard: std.toString(),
//                     subjectname: subjects
//                 });
//                 await newSubjectRecord.save();
//             }
//         }

//         // Decompose the request into ATOMIC database entries
//         const recordsToSave = [];
//         for (const sub of subjects) {
//             for (const std of standards) {
//                 for (const div of divisions) {
//                     recordsToSave.push({
//                         teacher: teacher, 
//                         teacherName: teacherName,
//                         subjects: [sub],
//                         standards: [std],
//                         divisions: [div],
//                         weeklyLectures: weeklyLectures,
//                     });
//                 }
//             }
//         }

//         if (recordsToSave.length === 0) {
//             return res.status(400).json({ message: "No valid assignments found to save." });
//         }

//         await subjectAllocation.insertMany(recordsToSave);

//         return res
//             .status(200)
//             .json({ message: "Subject allotment and master subject list updated successfully." });
//     } catch (error) {
//         console.error("Error saving subject allotments:", error);
//         return res.status(500).json({ error: error.message });
//     }
// };
exports.addSubjectAllot = async (req, res) => {
    try {
        const { teacher, teacherName, subjects, standards, divisions } = req.body;

        // Clean validation: no weeklyLectures required
        if (!teacher || !teacherName || !subjects || !standards || !divisions) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const recordsToSave = [];
        for (const sub of subjects) {
            for (const std of standards) {
                // Save ONE record per Sub/Std with the array of divisions
                recordsToSave.push({
                    teacher, 
                    teacherName,
                    subjects: [sub],
                    standards: [std],
                    divisions: divisions, 
                    weeklyLectures: 0 // Provide 0 to satisfy schema without UI input
                });
            }
        }

        await subjectAllocation.insertMany(recordsToSave);
        return res.status(200).json({ message: "Subject allotment completed successfully." });
    } catch (error) {
        return res.status(500).json({ message: error.message });
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
// exports.deleteAllocation = async (req, res) => {
//     try {
//         const { id } = req.params;
        
//         const response = await subjectAllocation.findByIdAndDelete(id);

//         if (!response) {
//             return res.status(404).json({ message: "Subject allotment not found." });
//         }

//         return res
//             .status(200)
//             .json({ message: "Subject allotment deleted successfully", data: response });
//     } catch (error) {
//         console.error("Error deleting subject allotment:", error);
//         return res.status(500).json({ error: error.message });
//     }
// };

exports.deleteAllocation = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Find the record first so we know what subject and standard it was for
        const allocationToDelete = await subjectAllocation.findById(id);

        if (!allocationToDelete) {
            return res.status(404).json({ message: "Subject allotment not found." });
        }

        const targetSubject = allocationToDelete.subjects[0]; // Assuming atomic storage
        const targetStandard = allocationToDelete.standards[0];

        // 2. Delete the record
        await subjectAllocation.findByIdAndDelete(id);

        // 3. --- SYNC WITH MASTER SUBJECT LIST ---
        // Check if any OTHER allocations still exist for this subject in this standard
        const otherAllocations = await subjectAllocation.findOne({
            subjects: targetSubject,
            standards: targetStandard
        });

        // If no one else is teaching this subject for this standard, remove it from the master list
        if (!otherAllocations) {
            const masterSubjectList = await Subject.findOne({ standard: targetStandard.toString() });
            
            if (masterSubjectList) {
                masterSubjectList.subjectname = masterSubjectList.subjectname.filter(
                    sub => sub !== targetSubject
                );

                // If no subjects left for this standard, you might want to delete the standard record entirely
                if (masterSubjectList.subjectname.length === 0) {
                    await Subject.findByIdAndDelete(masterSubjectList._id);
                } else {
                    await masterSubjectList.save();
                }
            }
        }

        return res.status(200).json({ 
            message: "Subject allotment deleted and master list synced successfully.", 
            data: allocationToDelete 
        });

    } catch (error) {
        console.error("Error deleting subject allotment:", error);
        return res.status(500).json({ error: error.message });
    }
};