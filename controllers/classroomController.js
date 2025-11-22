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

exports.getAllClassrooms = async (req, res) => {
    try {
        // 1. Aggregate Student Counts by Standard and Division
        const studentCounts = await Student.aggregate([
            {
                $group: {
                    _id: {
                        standard: "$admission.admissionstd", // Use nested student admission standard field
                        division: "$admission.admissiondivision" // Use nested student admission division field
                    },
                    count: { $sum: 1 } // Count students in that group
                }
            }
        ]);
        
        // 2. Fetch all Classroom Assignments
        const assignments = await classroom.find({}).lean(); // Use .lean() for faster results

        // 3. Merge the counts into the assignments
        const mergedAssignments = assignments.map(assignment => {
            
            // Note: Your data shows two assignments with the same standard: 5 and division: A.
            // This is a data integrity issue but we must handle the join.
            // We search for a matching count based on the class definition.
            const countMatch = studentCounts.find(sc => 
                sc._id.standard === assignment.standard && 
                sc._id.division === assignment.division
            );
            
            // Return the assignment object, overriding the database's 'studentcount: 0' field
            return {
                ...assignment,
                // If a count is found, use it; otherwise, default to 0
                studentcount: countMatch ? countMatch.count : 0
            };
        });

        return res.status(200).json(mergedAssignments);
    } catch (error) {
        console.error("Error fetching all classrooms with student counts:", error);
        return res.status(500).json({ message: "Internal Server Error" });
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