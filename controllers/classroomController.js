const classroom = require("../models/classroomModel");
const Student = require("../models/studentModel");
const Staff = require("../models/staffModel");
const subjectAllocation = require("../models/subjectAllocation");
const Subject = require("../models/subjectsModel");
// exports.addClassroom = async (req, res) => {
//   try {
//     const response = new classroom(req.body);
//     await response.save();
//     return res.status(200).json({ message: "added classroom successfully" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };
exports.addClassroom = async (req, res) => {
  try {
    const { standard, submittedBy } = req.body;
    const DIVISIONS = ["A", "B", "C", "D", "E"];
    
    // 🚀 FIX: Use $in to find the standard within the standards array
    const allotments = await SubjectAllocation.find({ standards: { $in: [standard] } });
    const subjectMaster = await Subject.findOne({ standard });

    if (!allotments.length || !subjectMaster) {
      return res.status(400).json({ 
        message: `No allotments found for Standard ${standard}. Please allot subjects first.` 
      });
    }

    const coreSubjectNames = subjectMaster.subjects
      .filter(s => s.type === "Compulsory")
      .map(s => s.name);

    const eligibleTeachers = allotments.filter(a => 
      a.subjects.some(sub => coreSubjectNames.includes(sub))
    );

    if (eligibleTeachers.length === 0) {
      return res.status(400).json({ message: "No core subject teachers available for assignment." });
    }

    const createdClassrooms = [];
    let availableTeachers = [...eligibleTeachers];

    for (const div of DIVISIONS) {
      const existing = await classroom.findOne({ standard, division: div });
      if (existing) continue;

      // If we run out of unique core teachers, reuse from the eligible pool
      if (availableTeachers.length === 0) {
          availableTeachers = [...eligibleTeachers];
      }

      const randomIndex = Math.floor(Math.random() * availableTeachers.length);
      const chosenTeacher = availableTeachers.splice(randomIndex, 1)[0];

      const newClass = new classroom({
        standard,
        division: div,
        staffid: chosenTeacher.teacher,
        studentcount: 0,
        student_ids: {},
        submittedBy: submittedBy || "Admin"
      });

      await newClass.save();
      createdClassrooms.push(newClass);
    }

    return res.status(200).json({ 
      message: `Successfully created ${createdClassrooms.length} classrooms for divisions A-E.` 
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 🚀 NEW FUNCTION: Add this to classroomController.js for the modal dropdown
exports.getEligibleTeachers = async (req, res) => {
    try {
        const { standard } = req.params;
        const allotments = await SubjectAllocation.find({ standards: { $in: [standard] } });
        const subjectMaster = await Subject.findOne({ standard });

        if (!allotments.length || !subjectMaster) return res.json([]);

        const coreNames = subjectMaster.subjects.filter(s => s.type === "Compulsory").map(s => s.name);
        const teachers = allotments
            .filter(a => a.subjects.some(sub => coreNames.includes(sub)))
            .map(a => ({ _id: a.teacher, firstname: a.teacherName.split(' ')[0], lastname: a.teacherName.split(' ')[1] || '', staffid: 'CORE' }));

        res.json(teachers);
    } catch (error) {
        res.status(500).json({ error: error.message });
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


exports.editClassroom = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Find the classroom by ID and update it with the new data from req.body
        const updatedClassroom = await classroom.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true } // Return the updated document and run schema validations
        );

        if (!updatedClassroom) {
            return res.status(404).json({ message: "Classroom assignment not found." });
        }

        return res.status(200).json({ 
            message: "Classroom assignment updated successfully.", 
            data: updatedClassroom 
        });
    } catch (error) {
        console.error("Error updating classroom:", error);
        
        // Handle duplicate key errors if the user tries to edit a class to a combination that already exists
        if (error.code === 11000) {
            return res.status(409).json({ error: "This Standard and Division combination already exists." });
        }

        return res.status(500).json({ error: error.message, message: "Internal Server Error during update." });
    }
};