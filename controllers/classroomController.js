const classroom = require("../models/classroomModel");
const Student = require("../models/studentModel");

exports.addClassroom = async (req, res) => {
  try {
    const response = new classroom(req.body);
    await response.save();
    return res.status(200).json({ message: "added classroom successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getClassTeacherByClass = async (req, res) => {
    try {
        const { standard, division } = req.params;

        // 1. Find the classroom assignment by Standard and Division
        const assignment = await classroom.findOne({ standard, division }).lean();

        if (!assignment || !assignment.staffid) {
            return res.status(404).json({ message: "Classroom assignment or Class Teacher not found." });
        }
        
        // 2. Fetch the Staff details (only need name) using the staffid
        // This line fails if Staff is not imported 👆
        const classTeacher = await Staff.findById(assignment.staffid)
            .select('firstname lastname') // Select only the necessary fields
            .lean();

        if (!classTeacher) {
            // Handle case where assignment exists but teacher record is missing
            return res.status(200).json({ 
                name: "Teacher Record Missing", 
                staffid: assignment.staffid 
            });
        }

        return res.status(200).json({
            name: `${classTeacher.firstname} ${classTeacher.lastname}`,
            staffid: assignment.staffid 
        });

    } catch (error) {
        console.error("Error fetching Class Teacher by class:", error);
        // Using 404 here matches the frontend's original failure mode
        return res.status(404).json({ message: "Failed to fetch class teacher details." }); 
    }
};

exports.deleteClassroom = async (req, res) => {
    try {
        const { id } = req.params;
        // FIX: Use the imported variable 'classroom' (lowercase)
        const result = await classroom.findByIdAndDelete(id); 

        if (!result) {
            return res.status(404).json({ message: "Classroom assignment not found." });
        }

        return res.status(200).json({ message: "Classroom assignment deleted successfully." });
    } catch (error) {
        console.error("Error deleting classroom:", error);
        return res.status(500).json({ error: error.message, message: "Internal Server Error during deletion." });
    }
};


exports.getClassTeacherByClass = async (req, res) => {
    try {
        const { standard, division } = req.params;

        // 1. Find the classroom assignment by Standard and Division
        const assignment = await classroom.findOne({ standard, division }).lean();

        if (!assignment || !assignment.staffid) {
            return res.status(404).json({ message: "Classroom assignment or Class Teacher not found." });
        }
        
        // 2. Fetch the Staff details (only need name) using the staffid (which is an _id in your classroom model)
        const classTeacher = await Staff.findById(assignment.staffid)
            .select('firstname lastname') // Select only the necessary fields
            .lean();

        if (!classTeacher) {
            // Handle case where assignment exists but teacher record is missing
            return res.status(200).json({ 
                name: "Teacher Record Missing", 
                staffid: assignment.staffid 
            });
        }

        return res.status(200).json({
            name: `${classTeacher.firstname} ${classTeacher.lastname}`,
            staffid: assignment.staffid 
        });

    } catch (error) {
        console.error("Error fetching Class Teacher by class:", error);
        // Using 404 here matches the frontend's original failure mode
        return res.status(404).json({ message: "Failed to fetch class teacher details." }); 
    }
};