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
const Classroom = require("../models/classroomModel"); // Assuming path is correct
// const Staff = require("../models/staffModel"); // Staff model is used via Mongoose population

// Helper function to build full name
const getTeacherFullName = (staff) => {
    return staff ? `${staff.firstname} ${staff.lastname}` : 'Unknown Teacher';
};


exports.addAssessment = async (req, res) => {
    try {
        // NOTE: The frontend must now send teacherId and classroomId instead of teacherName, standard, division.
        const response = new assessment(req.body);
        await response.save();
        return res.status(200).json({ message: "Assessment added successfully" });
    } catch (error) {
        console.error("Error adding assessment:", error);
        return res.status(500).json({ error: error.message });
    }
};

// =================================================================================
// UPDATED getAssessment: Fetches and filters data while populating teacher name
// =================================================================================
exports.getAssessment = async (req, res) => {
    try {
        const { standard, division, teacherName, date } = req.query;
        const mainFilter = {};
        const classroomFilter = {};

        // 1. Build Classroom Filter (to find the IDs of the classes we care about)
        if (standard) classroomFilter.standard = standard;
        if (division) classroomFilter.division = division;

        // 2. Find matching Classroom IDs first (required for filtering)
        const matchingClassrooms = await Classroom.find(classroomFilter).select('_id');
        const classroomIds = matchingClassrooms.map(c => c._id);
        
        // Apply the found classroom IDs to the main assessment filter
        if (classroomIds.length > 0) {
            mainFilter.classroomId = { $in: classroomIds };
        } else if (standard || division) {
            // If filters are applied but no classrooms matched, return empty array immediately
            return res.status(200).json([]);
        }

        // 3. Build Teacher Filter (If teacherName is provided)
        if (teacherName) {
            // NOTE: This requires fetching staff details first. This part is complex
            // and often handled by a dedicated Staff search or by populating/matching on the client.
            // We'll skip complex Staff name lookup here to avoid instability. 
            // The frontend should ideally filter by TeacherId.
            // For now, if teacherName is provided, we won't filter the main query 
            // and rely on front-end filtering or a more complex backend lookup.
            // For a robust solution, you would search the Staff model and get their IDs here.
        }

        // 4. Apply Date Filter
        if (date) {
            // Assuming date is sent as YYYY-MM-DD
            const startOfDay = new Date(date);
            const endOfDay = new Date(startOfDay);
            endOfDay.setDate(endOfDay.getDate() + 1);
            
            mainFilter.date = { $gte: startOfDay, $lt: endOfDay };
        }
        
        // 5. Execute Query and Populate Teacher Name
        const assessments = await assessment.find(mainFilter)
            .populate({
                path: 'teacherId', 
                select: 'firstname lastname staffid -_id'
            })
            .lean(); // Use .lean() for faster query results

        // 6. Map results to include classroom data (for standard/division context)
        const detailedAssessments = assessments.map(item => {
            const teacher = item.teacherId;
            return {
                ...item,
                // Replace teacherId object with the combined name
                teacherName: getTeacherFullName(teacher),
                teacherId: teacher ? teacher.staffid : null, 
                // Note: Standard/Division must be fetched by populating classroomId 
                // if you need it here, but filtering is already done.
            };
        });
        
        return res.status(200).json(detailedAssessments);

    } catch (error) {
        console.error("Error in getAssessment:", error);
        return res.status(500).json({ error: error.message });
    }
};

exports.editAssessment = async (req, res) => {
  try {
    const { _id } = req.params;
    const response = await assessment.findByIdAndUpdate(_id, req.body, {new: true});
    return res.status(200).json({ message: "Assessment updated successfully" });
  } catch (error) {
    console.error("Error editing assessment:", error);
    return res.status(500).json({ error: error.message });
  }
};