// const assessment = require("../models/assessmentModel");
// const homework = require("../models/homeworkModel");
// exports.addAssessment = async (req, res) => {
//   try {
//     const response = new assessment(req.body);
//     await response.save();
//     return res.status(200).json({ message: "assessment added successfully" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: error.message });
//   }
// };
// exports.getAssessment = async (req, res) => {
//   try {
//     const response = await assessment.find();
//     return res.status(200).json(response);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// // homework endpoints
// exports.addHomework = async (req, res) => {
//   try {
//     const response = new homework(req.body);
//     await response.save();
//     return res.status(200).json({ message: "added homework successfully" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// // edit assessment
// exports.editAssessment = async (req, res) => {
//   try {
//     const { _id } = req.params;
//     const response = await assessment.findByIdAndUpdate(_id, req.body, {new: true});
//     // console.log(response)
//     return res.status(200).json({ message: "assessment added successfully" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };



// assessmentController.js

const assessment = require("../models/assessmentModel");
const homework = require("../models/homeworkModel"); 
const Classroom = require("../models/classroomModel");
const mongoose = require("mongoose"); 

// Helper function to build full name from populated staff data
const getTeacherFullName = (staff) => {
    // Check if staff object exists and has name fields
    return staff && staff.firstname && staff.lastname 
        ? `${staff.firstname} ${staff.lastname}` 
        : 'Unknown Teacher';
};

// =================================================================================
// 1. ADD ASSESSMENT (Handles saving both Assessment and Homework)
//    Frontend POST body must include: teacherId, classroomId, date, subjectCovered, etc.
//    PLUS: homeworkDescription, submissionDeadline
// =================================================================================
exports.addAssessment = async (req, res) => {
    // Destructure homework fields and assessment fields
    const { 
        homeworkDescription, 
        submissionDeadline, 
        teacherId, 
        classroomId, 
        date, 
        subjectCovered, 
        topicCovered, 
        keyPoints, 
        classActivity
    } = req.body;
    
    // Basic validation for required relational and core fields
    if (!teacherId || !classroomId || !date || !subjectCovered || !topicCovered) {
        return res.status(400).json({ error: "Missing required assessment fields (teacherId, classroomId, date, subjectCovered, topicCovered)." });
    }

    try {
        // --- Step 1: Create the Homework record ---
        const newHomework = new homework({
            homeworkDescription: homeworkDescription,
            deadline: submissionDeadline, 
        });
        const savedHomework = await newHomework.save();

        // --- Step 2: Create the Assessment record, referencing the saved IDs ---
        const newAssessment = new assessment({
            teacherId: teacherId,
            classroomId: classroomId,
            date: date,
            subjectCovered: subjectCovered,
            topicCovered: topicCovered,
            keyPoints: keyPoints,
            classActivity: classActivity,
            homeworkId: savedHomework._id, // Link to the homework record
        });

        await newAssessment.save();
        
        return res.status(200).json({ message: "Assessment and homework added successfully" });

    } catch (error) {
        console.error("Error adding assessment and homework:", error);
        return res.status(500).json({ error: error.message, detail: error.reason || error.message });
    }
};

// =================================================================================
// 2. GET ASSESSMENT (Fetches, filters, and populates linked data)
// =================================================================================
// exports.getAssessment = async (req, res) => {
//     try {
//         const { standard, division, teacherId, date } = req.query; // Use teacherId for filtering
//         const mainFilter = {};
//         const classroomFilter = {};

//         // 1. Find matching Classroom IDs (Filter by standard/division)
//         if (standard) classroomFilter.standard = standard;
//         if (division) classroomFilter.division = division;

//         const matchingClassrooms = await Classroom.find(classroomFilter).select('_id');
//         const classroomIds = matchingClassrooms.map(c => c._id);
//         
//         // Apply the found classroom IDs to the main assessment filter
//         if (classroomIds.length > 0) {
//             mainFilter.classroomId = { $in: classroomIds };
//         } else if (standard || division) {
//             // If filters are present but no classrooms matched, return empty result
//             return res.status(200).json([]);
//         }

//         // 2. Apply Teacher ID Filter (if provided)
//         if (teacherId) {
//             mainFilter.teacherId = teacherId;
//         }

//         // 3. Apply Date Filter
//         if (date) {
//             const startOfDay = new Date(date);
//             const endOfDay = new Date(startOfDay);
//             endOfDay.setDate(endOfDay.getDate() + 1);
//             
//             mainFilter.date = { $gte: startOfDay, $lt: endOfDay };
//         }
//         
//         // 4. Execute Query and Populate related data
//         const assessments = await assessment.find(mainFilter)
//             .populate({
//                 path: 'teacherId', 
//                 select: 'firstname lastname staffid -_id'
//             })
//             .populate({
//                 path: 'classroomId', 
//                 select: 'standard division staffid -_id'
//             })
//             .populate({
//                 path: 'homeworkId',
//                 select: 'homeworkDescription deadline -_id' 
//             })
//             .lean();

//         // 5. Map results to flatten data for the frontend
//         const detailedAssessments = assessments.map(item => {
//             const teacher = item.teacherId;
//             const classroom = item.classroomId;
//             const hw = item.homeworkId;

//             return {
//                 _id: item._id,
//                 
//                 // Teacher Info (Flattened)
//                 teacherName: getTeacherFullName(teacher),
                
//                 // Classroom Context (Flattened for list page filters)
//                 standard: classroom ? classroom.standard : 'N/A',
//                 division: classroom ? classroom.division : 'N/A',
                
//                 // Assessment Details
//                 subjectCovered: item.subjectCovered,
//                 topicCovered: item.topicCovered,
//                 keyPoints: item.keyPoints,
//                 classActivity: item.classActivity,
//                 date: item.date,
                
//                 // Homework Details (Flattened)
//                 homeworkDescription: hw ? hw.homeworkDescription : null,
//                 submissionDeadline: hw ? hw.deadline : null,
//             };
//         });
//         
//         return res.status(200).json(detailedAssessments);

//     } catch (error) {
//         console.error("Error in getAssessment:", error);
//         return res.status(500).json({ error: error.message, detail: "Error during MongoDB query or population." });
//     }
// };
exports.getAssessments = async (req, res) => {
    try {
        const { standard, division, date, teacherId } = req.query;
        let query = {};

        if (standard) query.standard = standard;
        if (division) query.division = division;
        if (teacherId) query.teacherId = teacherId;

        // ✅ FIX: Handle date as a range to match ISO format in DB
        if (date) {
            // Convert "02/02/2026" to a standard Date object
            const [day, month, year] = date.split('/');
            const searchDate = new Date(year, month - 1, day);

            // Create boundaries for the entire day
            const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

            query.date = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        const assessments = await Assessment.find(query);
        res.status(200).json(assessments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// =================================================================================
// 3. EDIT ASSESSMENT (Handles updating both Assessment and Homework)
// =================================================================================
exports.editAssessment = async (req, res) => {
    try {
        const { _id } = req.params;
        const { homeworkDescription, submissionDeadline, ...assessmentData } = req.body;

        // --- Step 1: Find and Update the Assessment record ---
        // Find the existing assessment first to get the homeworkId
        const existingAssessment = await assessment.findById(_id).select('homeworkId');

        const updatedAssessment = await assessment.findByIdAndUpdate(_id, assessmentData, { new: true });
        
        if (!updatedAssessment) {
            return res.status(404).json({ message: "Assessment not found." });
        }

        // --- Step 2: Update the corresponding Homework record ---
        if (existingAssessment && existingAssessment.homeworkId) {
            await homework.findByIdAndUpdate(existingAssessment.homeworkId, {
                homeworkDescription: homeworkDescription,
                deadline: submissionDeadline,
            });
        }
        
        return res.status(200).json({ message: "Assessment and homework updated successfully" });
    } catch (error) {
        console.error("Error editing assessment:", error);
        return res.status(500).json({ error: error.message });
    }
};