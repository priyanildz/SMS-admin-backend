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



const assessment = require("../models/assessmentModel");
const homework = require("../models/homeworkModel"); // Your separate homework model
const Classroom = require("../models/classroomModel");
const mongoose = require("mongoose"); // Needed for ObjectId operations

// Helper function to build full name from populated staff data
const getTeacherFullName = (staff) => {
    return staff ? `${staff.firstname} ${staff.lastname}` : 'Unknown Teacher';
};

// =================================================================================
// 1. ADD ASSESSMENT (Handles saving both Assessment and Homework)
//    Frontend must send: teacherId, classroomId, date, subjectCovered, topicCovered, etc.
//    PLUS: homeworkDescription, submissionDeadline (for the Homework model).
// =================================================================================
exports.addAssessment = async (req, res) => {
    // Destructure homework fields from the main request body
    const { 
        homeworkDescription, 
        submissionDeadline, 
        ...assessmentData 
    } = req.body;
    
    // Validate required fields (customize as needed)
    if (!assessmentData.teacherId || !assessmentData.classroomId || !assessmentData.date || !assessmentData.subjectCovered) {
        return res.status(400).json({ error: "Missing required fields (teacherId, classroomId, date, subjectCovered)." });
    }

    try {
        // --- Step 1: Create the Homework record ---
        const newHomework = new homework({
            homeworkDescription: homeworkDescription,
            deadline: submissionDeadline, // Use 'deadline' field from your homeworkSchema
        });
        const savedHomework = await newHomework.save();

        // --- Step 2: Create the Assessment record, referencing the saved homework ID ---
        const newAssessment = new assessment({
            ...assessmentData,
            homeworkId: savedHomework._id, // Link the assessment to the homework record
        });

        await newAssessment.save();
        
        return res.status(200).json({ message: "Assessment and homework added successfully" });

    } catch (error) {
        console.error("Error adding assessment and homework:", error);
        // If save fails, check if the homework needs to be deleted to clean up
        // (Advanced cleanup logic omitted for brevity, but recommended in production)
        return res.status(500).json({ error: error.message });
    }
};

// =================================================================================
// 2. GET ASSESSMENT (Fetches, filters, and populates linked data)
// =================================================================================
exports.getAssessment = async (req, res) => {
    try {
        const { standard, division, teacherName, date } = req.query;
        const mainFilter = {};
        const classroomFilter = {};

        // 1. Find matching Classroom IDs (Filter by standard/division)
        if (standard) classroomFilter.standard = standard;
        if (division) classroomFilter.division = division;

        const matchingClassrooms = await Classroom.find(classroomFilter).select('_id');
        const classroomIds = matchingClassrooms.map(c => c._id);
        
        // Apply the found classroom IDs to the main assessment filter
        if (classroomIds.length > 0) {
            mainFilter.classroomId = { $in: classroomIds };
        } else if (standard || division) {
            return res.status(200).json([]);
        }

        // 2. Apply Date Filter
        if (date) {
            const startOfDay = new Date(date);
            const endOfDay = new Date(startOfDay);
            endOfDay.setDate(endOfDay.getDate() + 1);
            
            mainFilter.date = { $gte: startOfDay, $lt: endOfDay };
        }
        
        // 3. Execute Query and Populate Teacher Name and Homework Details
        const assessments = await assessment.find(mainFilter)
            .populate({
                path: 'teacherId', 
                select: 'firstname lastname staffid -_id'
            })
            .populate({
                path: 'classroomId', 
                select: 'standard division staffid -_id'
            })
            .populate({
                path: 'homeworkId', // Populates the separate homework record
                select: 'homeworkDescription deadline -_id' 
            })
            .lean();

        // 4. Map results to combine fields for frontend display
        const detailedAssessments = assessments.map(item => {
            const teacher = item.teacherId;
            const classroom = item.classroomId;
            const hw = item.homeworkId;

            return {
                _id: item._id,
                // Teacher Info
                teacherName: getTeacherFullName(teacher),
                // Assessment Details
                subjectCovered: item.subjectCovered,
                topicCovered: item.topicCovered,
                keyPoints: item.keyPoints,
                classActivity: item.classActivity,
                date: item.date,
                // Classroom Context (for filters/display)
                standard: classroom ? classroom.standard : 'N/A',
                division: classroom ? classroom.division : 'N/A',
                // Homework Details (flat for frontend consumption)
                homeworkDescription: hw ? hw.homeworkDescription : null,
                submissionDeadline: hw ? hw.deadline : null,
            };
        });
        
        return res.status(200).json(detailedAssessments);

    } catch (error) {
        console.error("Error in getAssessment:", error);
        return res.status(500).json({ error: error.message });
    }
};

// =================================================================================
// 3. EDIT ASSESSMENT (Needs to handle updating both Assessment and Homework)
// =================================================================================
exports.editAssessment = async (req, res) => {
    try {
        const { _id } = req.params;
        const { homeworkDescription, submissionDeadline, ...assessmentData } = req.body;

        // --- Step 1: Update the Assessment record ---
        const updatedAssessment = await assessment.findByIdAndUpdate(_id, assessmentData, { new: true });
        
        if (!updatedAssessment) {
            return res.status(404).json({ message: "Assessment not found." });
        }

        // --- Step 2: Update the corresponding Homework record ---
        if (updatedAssessment.homeworkId) {
            await homework.findByIdAndUpdate(updatedAssessment.homeworkId, {
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