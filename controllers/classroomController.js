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
        // 1. Fetch Student Counts by Standard and Division using Aggregation
        const studentCounts = await Student.aggregate([
            {
                $group: {
                    _id: {
                        // Grouping key 1: Standard
                        standard: "$admission.admissionstd", 
                        // Grouping key 2: Use the Division, but ensure it's not null/missing 
                        // Note: If students are sometimes saved with null/undefined division, 
                        // they won't be counted for any class unless specifically grouped.
                        division: "$admission.admissiondivision" 
                    },
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // 2. Fetch all Classroom Assignments
        const assignments = await classroom.find({}).lean(); 

        // 3. Merge the counts into the assignments
        const mergedAssignments = assignments.map(assignment => {
            
            // Search for a matching count based on both Standard and Division
            const countMatch = studentCounts.find(sc => {
                const isStandardMatch = sc._id.standard === assignment.standard;
                const isDivisionMatch = sc._id.division === assignment.division;
                
                // CRITICAL LOGIC: If the student division is an empty string, 
                // it will only match a classroom division that is ALSO an empty string.
                // Since your classroom divisions are letters ("A", "D", "E"), 
                // the student records need accurate division letters for the count to match.
                
                return isStandardMatch && isDivisionMatch;
            });
            
            // The logic here is correct: take the count if found, otherwise 0
            return {
                ...assignment,
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