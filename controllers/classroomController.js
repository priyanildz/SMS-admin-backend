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
        const classrooms = await classroom.find({});
        
        // 1. Get all unique standard/division combinations
        const classList = classrooms.map(c => ({ 
            standard: c.standard, 
            division: c.division, 
            _id: c._id // Retain ID for easy mapping
        }));
        
        // 2. Perform aggregation on the student collection to get counts
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
        
        // 3. Merge the counts back into the classroom assignments
        const mergedAssignments = classrooms.map(assignment => {
            const countMatch = studentCounts.find(sc => 
                sc._id.standard === assignment.standard && 
                sc._id.division === assignment.division
            );
            
            return {
                ...assignment._doc, // Use _doc if it's a Mongoose document
                studentcount: countMatch ? countMatch.count : 0
            };
        });

        return res.status(200).json(mergedAssignments);
    } catch (error) {
        console.error("Error fetching all classrooms with counts:", error);
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