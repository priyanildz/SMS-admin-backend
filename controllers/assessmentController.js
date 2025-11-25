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


const Classroom = require("../models/classroomModel"); // Your provided model
const Student = require("../models/studentModel");   // You need a Student model

exports.getClassroomsWithDetails = async (req, res) => {
    try {
        // 1. Fetch Classrooms and populate the Staff details
        let classrooms = await Classroom.find()
            .populate({
                path: 'staffid', 
                // Assumes your Staff model has 'firstname' and 'lastname'
                select: 'firstname lastname staffid -_id' 
            });

        // 2. Fetch Student Details (More complex due to 'student_ids' type)
        // Since 'student_ids' is defined as an Object, we need a separate step.
        // If 'student_ids' contained an array of student ObjectIds, we could populate it directly.
        // For simplicity, we'll demonstrate how to structure the result with staff names:

        const classroomsWithStudents = classrooms.map(classroom => {
            // Combine first and last name for easy display
            const staffFullName = classroom.staffid 
                ? `${classroom.staffid.firstname} ${classroom.staffid.lastname}`
                : 'N/A';

            return {
                _id: classroom._id,
                standard: classroom.standard,
                division: classroom.division,
                studentcount: classroom.studentcount,
                // Include the full name of the class teacher
                classTeacherName: staffFullName,
                classTeacherId: classroom.staffid ? classroom.staffid.staffid : null,
                // NOTE: Fetching and mapping actual student names requires
                // calling the Student model based on the student_ids field,
                // which is omitted here as the exact structure of student_ids is complex (Object).
                // If student_ids were an array of ObjectIds, Mongoose could populate it here.
            };
        });

        return res.status(200).json(classroomsWithStudents);

    } catch (error) {
        console.error("Error fetching classroom details:", error);
        return res.status(500).json({ error: error.message });
    }
};