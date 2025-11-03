const StudentLC = require("../models/StudentLCModel");
const User = require("../models/studentModel");
const studentsAttendence = require("../models/studentAttendence");

// ----------------------------------------------------
// Student Management Endpoints
// ----------------------------------------------------

exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    // Use 201 for resource creation
    res.status(201).json({ message: "Student created successfully" });
  } catch (error) {
    console.error("Error creating student:", error);

    // Mongoose duplicate unique fields (Code 11000)
    if (error.code && error.code === 11000) {
      // Return 409 Conflict for unique field violations (e.g., duplicate studentid)
      return res.status(409).json({
        message: "Data conflict: A student with this unique ID/number already exists.",
        error: error.message
      });
    }

    // Mongoose validation errors (e.g., missing 'required' field)
    if (error.name === "ValidationError") {
      // Return 400 Bad Request for validation issues
      return res.status(400).json({
        message: "Validation failed. Please check all required fields and data formats.",
        errors: error.message,
      });
    }

    // Fallback for general server errors
    res.status(500).json({ error: error.message, message: "Internal Server Error during student creation." });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ status: { $ne: false } }); // Only fetch active students
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: error.message, message: "Internal Server Error." });
  }
};

exports.getNewStudents = async (req, res) => {
  try {
    const students = await User.find({
      "admission.admissiondate": {
        $gte: new Date("2024-01-01"), // Consider passing the date as a query parameter for flexibility
      },
      status: {
        $ne: false // Only new, non-LC students
      }
    });
    return res.status(200).send(students);
  } catch (error) {
    console.error("Error fetching new students:", error);
    return res.status(500).send({ message: "Error fetching new students: " + error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    // Standard practice is to get ID from params for GET requests, 
    // but the original code used req.body. I've updated it to use a unified `id` from body or params.
    const id = req.body.id || req.params.id; 
    
    if (!id) {
      return res.status(400).send({ message: "Please provide student ID" });
    }
    
    const data = await User.findById(id);
    
    if (!data) {
      return res.status(404).send({ message: "Student not found!" });
    }
    
    return res.status(200).send(data);
  } catch (error) {
    // If the ID format is invalid (e.g., not a valid MongoDB ObjectId), Mongoose throws a CastError.
    if (error.name === 'CastError') {
      return res.status(400).send({ message: "Invalid student ID format." });
    }
    console.error("Error in getStudentById:", error);
    return res.status(500).send({ message: "Server error fetching student by ID", error: error.message });
  }
};

exports.getStudentByStd = async (req, res) => {
  try {
    // Using req.query or req.params is generally better for GET filter operations
    // but sticking to req.body as per the original code.
    const { standard, division } = req.body;
    
    if (!standard || !division) {
      return res
        .status(400) // Changed from 500 to 400
        .json({ error: "Standard and Division are required" });
    }

    const response = await User.find({
      "admission.admissionstd": standard,
      "admission.admissiondivision": division,
      status: { $ne: false } // Only show active students
    });
    
    if (response.length === 0) {
      return res.status(404).json({ message: "No students found for this Standard and Division." });
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching students by standard/division:", error); 
    
    return res.status(500).json({ 
        error: error.message, 
        message: "Internal server error during student query." 
    });
  }
};

exports.editStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body; 
    
    // The runValidators: true option ensures Mongoose validation runs on the update
    const updatedStudent = await User.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );
    
    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    res.status(200).json({ message: "Student updated successfully", updatedStudent });
  } catch (error) {
    console.error("Error updating student:", error);

    // Specific error handling for Mongoose validation
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Update failed due to validation errors.",
        errors: error.message, 
      });
    }

    // Specific error handling for Mongoose duplicate unique fields
    if (error.code && error.code === 11000) {
      return res.status(409).json({
        message: "Data conflict: This updated data violates a unique field constraint.",
      });
    }
    
    // General error for invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid student ID format for update." });
    }
    
    res.status(500).json({ error: "Internal server error during student update." });
  }
};

// ----------------------------------------------------
// LC (Leaving Certificate) Endpoints
// ----------------------------------------------------

// FIXED: The missing closing curly braces in the original code.
exports.addLcStudents = async (req, res) => {
  try {
    const { studentid } = req.params;
    
    const newLcStudent = await User.findByIdAndUpdate(
      studentid,
      { status: false }, // Set status to false to mark as LC student
      { new: true }
    )
    
    if (!newLcStudent) {
      return res.status(404).send({ message: 'No student found with this ID!' })
    }
    
    // Check if the student was actually set to false (already being an LC student wouldn't hurt)
    if (newLcStudent.status === false) {
      return res.status(200).send({ message: 'Student successfully marked for Leaving Certificate (status: false).' })
    } else {
      return res.status(200).send({ message: 'Student status updated, but confirmation needed.' })
    }

  } catch (error) {
    console.error(error)
    
    if (error.name === 'CastError') {
      return res.status(400).send({ message: "Invalid student ID format." });
    }

    return res.status(500).send({
      message: 'Error while updating LC student status.',
      error: error.message
    });
  }
};

exports.getLCStudents = async (req, res) => {
  try {
    const lcStudents = await User.find({
      status: false // Find all students marked with status: false
    })
    
    if (lcStudents.length === 0) {
      return res.status(200).send({ message: 'No LC Students found.' })
    }
    
    return res.status(200).send(lcStudents)
  } catch (error) {
    console.error("Error In LC students: ", error)
    return res.status(500).send({ message: "Internal Server Error fetching LC students.", error: error.message })
  }
};

// ----------------------------------------------------
// Attendance Endpoints
// ----------------------------------------------------

exports.addAttendence = async (req, res) => {
  try {
    const { std, div, students, date } = req.body;

    // Improved validation
    if (!std || !div || !date || !students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).send({ message: "Please provide complete and valid data for attendance (standard, division, date, and a non-empty array of students)." });
    }
    
    // Check if attendance for this date/std/div already exists
    const existingAttendance = await studentsAttendence.findOne({ std, div, date });
    if (existingAttendance) {
        return res.status(409).send({ message: "Attendance for this Standard, Division, and Date has already been recorded." });
    }

    const studentsData = new studentsAttendence({
      std,
      div,
      students,
      date
    });
    await studentsData.save();
    return res.status(201).send({ message: "Students Attendance Added successfully!" });
  } catch (error) {
    console.error("Error adding attendance:", error);
    res.status(500).send({ message: "Internal Server Error during attendance addition!:- " + error.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    // Recommended to use req.query for GET filters, but maintaining req.body structure
    const { std, div, date } = req.body;      
    
    if (!std || !div || !date) {
      return res.status(400).send({ message: "Please provide complete data (Standard, Division, and Date)!" });
    }
    
    const attendance = await studentsAttendence.findOne({
      std,
      div,
      date
    });
    
    if (!attendance) {
      return res.status(404).send({ message: "No attendance found for the specified criteria!" });
    }

    return res.status(200).send(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return res.status(500).send({ message: "Internal Server Error!:- " + error.message });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const attendance = await studentsAttendence.find();
    
    if (attendance.length === 0) {
      return res.status(200).send({ message: "No attendance records found." });
    }
    
    return res.status(200).send(attendance);
  } catch (error) {
    console.error("Error fetching all attendance:", error);
    return res.status(500).send({ message: "Internal Server Error!:- " + error.message });
  }
};