const classroom = require("../models/classroomModel");
const Student = require("../models/studentModel");
const Staff = require("../models/staffModel");
const SubjectAllocation = require("../models/subjectAllocation");
const Subject = require("../models/subjectsModel");


// --- NEW: Core logic to auto-generate class teachers based on subject allotments ---
exports.autoGenerateClassTeachers = async (req, res) => {
    try {
        const { standard } = req.body;
        const DIVISIONS = ["A", "B", "C", "D", "E"];

        // 1. Find Compulsory subjects for this standard
        const subjectConfig = await Subject.findOne({ standard });
        if (!subjectConfig) return res.status(404).json({ message: "No subject configuration found for this standard." });

        const coreSubjectNames = subjectConfig.subjects
            .filter(s => s.type === "Compulsory")
            .map(s => s.name);

        // 2. Find all teachers teaching these core subjects in this standard
        const coreAllocations = await SubjectAllocation.find({
            standards: standard,
            subjects: { $in: coreSubjectNames }
        }).distinct('teacher');

        if (coreAllocations.length === 0) {
            return res.status(400).json({ message: "No core subject teachers allotted yet for this standard." });
        }

        // 3. Find teachers already assigned as class teachers (to avoid double duty)
        const busyTeachers = await classroom.find().distinct('staffid');
        let availableTeachers = coreAllocations.filter(id => !busyTeachers.some(busyId => busyId.equals(id)));

        const results = [];

        // 4. Iterate through divisions A-E
        for (const div of DIVISIONS) {
            const existingClass = await classroom.findOne({ standard, division: div });

            if (!existingClass) {
                if (availableTeachers.length === 0) break; // Stop if we run out of unique teachers

                // Pick a random available core teacher
                const randomIndex = Math.floor(Math.random() * availableTeachers.length);
                const assignedTeacherId = availableTeachers[randomIndex];

                const newClass = new classroom({
                    standard,
                    division: div,
                    staffid: assignedTeacherId,
                    studentcount: 0,
                    student_ids: {}
                });

                await newClass.save();
                results.push({ div, status: "Assigned", teacherId: assignedTeacherId });

                // Remove assigned teacher from the available pool for the next division
                availableTeachers.splice(randomIndex, 1);
            } else {
                results.push({ div, status: "Already Exists" });
            }
        }

        return res.status(200).json({ message: "Automation check complete", results });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// --- NEW: Fetch only eligible core teachers for the Edit Modal dropdown ---
exports.getEligibleTeachers = async (req, res) => {
    try {
        const { standard } = req.params;
        
        const subjectConfig = await Subject.findOne({ standard });
        if (!subjectConfig) return res.status(200).json([]);

        const coreSubjectNames = subjectConfig.subjects
            .filter(s => s.type === "Compulsory")
            .map(s => s.name);

        const allocations = await SubjectAllocation.find({
            standards: standard,
            subjects: { $in: coreSubjectNames }
        }).distinct('teacher');

        // Teachers who are NOT currently class teachers (excluding the one being edited, handled on frontend)
        const alreadyAssigned = await classroom.find().distinct('staffid');

        const eligibleStaff = await Staff.find({
            _id: { $in: allocations, $nin: alreadyAssigned },
            status: true
        }).select('firstname lastname staffid');

        return res.status(200).json(eligibleStaff);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

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
// Add this helper function to classroomController.js
// classroomController.js

// exports.internalAutoGenerate = async (standard) => {
//     try {
//         const DIVISIONS = ["A", "B", "C", "D", "E"];
        
//         // 1. Fetch Subject Configuration for this standard
//         const subjectConfig = await Subject.findOne({ standard: standard.toString() });
//         if (!subjectConfig) return;

//         // 2. Filter only "Compulsory" subjects
//         const coreSubjectNames = subjectConfig.subjects
//             .filter(s => s.type === "Compulsory")
//             .map(s => s.name);

//         // 3. Find all teachers allotted to these Compulsory subjects for this standard
//         const coreAllocations = await SubjectAllocation.find({
//             standards: standard.toString(),
//             subjects: { $in: coreSubjectNames }
//         }).distinct('teacher');

//         if (coreAllocations.length === 0) return;

//         // 4. Assign teachers to Divisions A through E uniquely
//         for (const div of DIVISIONS) {
//             // Check if this specific class already has a teacher
//             const existingClass = await classroom.findOne({ 
//                 standard: standard.toString(), 
//                 division: div 
//             });

//             if (!existingClass) {
//                 // Find teachers from our core list who are NOT already assigned as a class teacher ANYWHERE
//                 const busyTeachers = await classroom.find().distinct('staffid');
                
//                 // Filter the core teachers list to find someone truly free
//                 const trulyFreeTeachers = coreAllocations.filter(teacherId => 
//                     !busyTeachers.some(busyId => busyId.equals(teacherId))
//                 );

//                 if (trulyFreeTeachers.length > 0) {
//                     // Assign the first available free teacher
//                     const assignedTeacherId = trulyFreeTeachers[0];

//                     const newClass = new classroom({
//                         standard: standard.toString(),
//                         division: div,
//                         staffid: assignedTeacherId,
//                         studentcount: 20,
//                         student_ids: {}
//                     });
//                     await newClass.save();
//                 } else {
//                     console.log(`No unique core teachers available for ${standard}-${div}`);
//                 }
//             }
//         }
//     } catch (error) {
//         console.error("Auto-Assignment Internal Error:", error.message);
//     }
// };
// classroomController.js

// classroomController.js

exports.internalAutoGenerate = async (standard) => {
    try {
        const DIVISIONS = ["A", "B", "C", "D", "E"];
        
        // 1. Fetch Subject Configuration to find "Compulsory" subjects
        const subjectConfig = await Subject.findOne({ standard: standard.toString() });
        if (!subjectConfig) return;

        const coreSubjectNames = subjectConfig.subjects
            .filter(s => s.type === "Compulsory")
            .map(s => s.name);

        // 2. Find all teachers allotted to these Compulsory subjects for this standard
        const coreAllocations = await SubjectAllocation.find({
            standards: standard.toString(),
            subjects: { $in: coreSubjectNames }
        }).distinct('teacher');

        if (coreAllocations.length === 0) return;

        // 3. Automated Assignment for Divisions A through E
        for (const div of DIVISIONS) {
            // Check if this specific classroom already has an assignment
            const existingClass = await classroom.findOne({ 
                standard: standard.toString(), 
                division: div 
            });

            if (!existingClass) {
                // 🔥 UNIQUE ASSIGNMENT LOGIC:
                // Find teachers from our core list who are NOT already assigned as a class teacher 
                // in ANY standard or division.
                const busyTeachers = await classroom.find().distinct('staffid');
                
                const availableTeachers = coreAllocations.filter(teacherId => 
                    !busyTeachers.some(busyId => busyId.toString() === teacherId.toString())
                );

                if (availableTeachers.length > 0) {
                    // Assign the first available unique core teacher
                    const assignedTeacherId = availableTeachers[0];

                    const newClass = new classroom({
                        standard: standard.toString(),
                        division: div,
                        staffid: assignedTeacherId,
                        studentcount: 20,
                        student_ids: {}
                    });
                    await newClass.save();
                } else {
                    console.log(`No unique core teachers left for ${standard}-${div}. Manual assignment required.`);
                }
            }
        }
    } catch (error) {
        console.error("Auto-Assignment Error:", error.message);
    }
};