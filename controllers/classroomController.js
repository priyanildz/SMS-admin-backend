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
    
    // 1. Find all teachers alloted to this standard
    const allotments = await SubjectAllocation.find({ standards: standard });
    const subjectMaster = await Subject.findOne({ standard });

    if (!allotments.length || !subjectMaster) {
      return res.status(400).json({ message: "No subject allotments found for this standard to assign teachers." });
    }

    // 2. Identify Core (Compulsory) Subject Teachers
    const coreSubjectNames = subjectMaster.subjects
      .filter(s => s.type === "Compulsory")
      .map(s => s.name);

    const eligibleTeachers = allotments.filter(a => 
      a.subjects.some(sub => coreSubjectNames.includes(sub))
    );

    // 3. Create classrooms for each division
    const createdClassrooms = [];
    let availableTeachers = [...eligibleTeachers];

    for (const div of DIVISIONS) {
      // Check if already exists
      const existing = await classroom.findOne({ standard, division: div });
      if (existing) continue;

      if (availableTeachers.length === 0) break;

      // Randomly pick an eligible teacher
      const randomIndex = Math.floor(Math.random() * availableTeachers.length);
      const chosenTeacher = availableTeachers.splice(randomIndex, 1)[0];

      const newClass = new classroom({
        standard,
        division: div,
        staffid: chosenTeacher.teacher,
        studentcount: 0,
        student_ids: {},
        submittedBy
      });

      await newClass.save();
      createdClassrooms.push(newClass);
    }

    return res.status(200).json({ message: `Successfully created ${createdClassrooms.length} classrooms.` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getEligibleClassTeachers = async (req, res) => {
    try {
        const { standard } = req.params;

        // 1. Get all subject allotments for this standard
        const allotments = await subjectAllocation.find({ standards: standard });
        
        // 2. Get subject master to identify "Compulsory" subjects
        const subjectMaster = await Subject.findOne({ standard });
        if (!subjectMaster) return res.status(404).json({ message: "Subjects not configured for this standard." });

        const compulsorySubjectNames = subjectMaster.subjects
            .filter(s => s.type === "Compulsory")
            .map(s => s.name);

        // 3. Filter allotments to find teachers teaching compulsory subjects in this standard
        const coreTeacherIds = allotments
            .filter(allot => allot.subjects.some(sub => compulsorySubjectNames.includes(sub)))
            .map(allot => allot.teacher.toString());

        // 4. Find teachers already assigned as Class Teachers (to any standard/division)
        const assignedClassroomTeachers = await classroom.find({}, 'staffid').lean();
        const alreadyAssignedIds = assignedClassroomTeachers.map(c => c.staffid.toString());

        // 5. Fetch full staff details for those core teachers who are NOT already Class Teachers
        // Note: If in 'Edit' mode, the current teacher of that class should be included (handled in frontend)
        const eligibleStaff = await Staff.find({
            _id: { $in: coreTeacherIds },
            // Filter out those already assigned elsewhere
        }).select('firstname lastname middlename staffid').lean();

        // Return only those not in the 'alreadyAssignedIds' list
        const filteredEligible = eligibleStaff.filter(s => !alreadyAssignedIds.includes(s._id.toString()));

        return res.status(200).json(filteredEligible);
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