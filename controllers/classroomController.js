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
        // 1. Fetch all existing classroom assignments
        const assignments = await classroom.find({}).lean(); // Use .lean() for faster aggregation/mapping
        
        // 2. Perform a single aggregation query on the student collection to get counts for all classes
        // This is much faster than querying for each class individually.
        const studentCounts = await Student.aggregate([
            {
                $group: {
                    _id: {
                        standard: "$standard", // Assuming student model has these fields
                        division: "$division"
                    },
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // 3. Merge the calculated counts back into the classroom assignments
        const mergedAssignments = assignments.map(assignment => {
            const countMatch = studentCounts.find(sc => 
                sc._id.standard === assignment.standard && 
                sc._id.division === assignment.division
            );
            
            // Return the assignment object, overriding the saved studentcount (which is 0)
            return {
                ...assignment,
                studentcount: countMatch ? countMatch.count : 0
            };
        });

        return res.status(200).json(mergedAssignments);
    } catch (error) {
        console.error("Error fetching all classrooms with student counts:", error);
        return res.status(500).json({ message: "Internal Server Error during fetching with count." });
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