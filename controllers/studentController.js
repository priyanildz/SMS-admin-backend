const StudentLC = require("../models/StudentLCModel");
const User = require("../models/studentModel");
const studentsAttendence = require("../models/studentAttendence");
exports.createUser = async (req, res) => {
  try {
    // console.log('received msg: ',req.body)
    const user = new User(req.body);
    await user.save();
    res.status(200).json({ message: "student created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
exports.getStudents = async (req, res) => {
  try {
    const students = await User.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getNewStudents = async (req, res) => {
  try {
    const students = await User.find({
      "admission.admissiondate": {
        $gte: new Date("2024-01-01"),
      },
    });
    // console.log(students)
    return res.status(200).send(students);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error: " + error });
  }
};

exports.addLcStudents = async (req, res) => {
  try {
    const { studentid } = req.params;
    if (studentid == {}) {
      return res.status(500).send({ message: "Please provide studentid" });
    }
    const student = await User.find({ studentid });
    if (student.length <= 0) {
      return res.status(404).send({ message: "No student found with this id" });
    }
    const studentlc = new StudentLC({
      lc_no: String(Date.now()),
      studentid: studentid,
    });
    await studentlc.save();
    return res.status(200).send({ message: "student LC added" });
  } catch (error) {
    console.log("error occured: ", error);
    return res.status(500).send({ message: "error: " + error });
  }
};

exports.getLCStudents = async (req, res) => {
  try {
    const lcstudent = await StudentLC.find();
    if (lcstudent.length <= 0) {
      return res.status(404).send({ message: "no lc students." });
    }
    var students = [];
    for (const element of lcstudent) {
      const data = await User.find({
        studentid: element.studentid,
      });
      students.push(data);
    }
    // console.warn(students);
    return res.status(200).json(students.flat());
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).send({ message: "Error: " + error });
  }
};

exports.getStudentByStd = async (req, res) => {
  try {
    const { standard, division } = req.body;
    if (!standard || !division) {
      return res
        .status(400)
        .json({ error: "Standard and Division are required" });
    }

    // for now admission std and division is used
    const response = await User.find({
      "admission.admissionstd": standard,
      "admission.admissiondivision": division,
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//for attendence
exports.addAttendence = async (req, res) => {
  try {
    const { std, div, students, date } = req.body;

    if (
      !std ||
      !div ||
      !students ||
      !Array.isArray(students) ||
      students.length === 0
    ) {
      return res.status(400).send({ message: "Please Provide complete data!" });
    }
    const studentsData = new studentsAttendence({
      std,
      div,
      students,
      date
    });
    await studentsData.save();
    return res.status(201).send({ message: "Students Attendence Added!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error!:- " + error });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    if (!id) {
      return res.status(500).send({ message: "Please give complete data" });
    }
    const data = await User.findById(id);
    if (!data) {
      return res.status(404).send({ message: "User not found!" });
    }
    console.log(data);
    return res.status(200).send(data);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error });
  }
};

// in studentController.js
exports.getAttendance = async (req, res) => {
  try {
    const { std, div, date } = req.body;      
    if (!std || !div || !date) {
      return res.status(400).send({ message: "Please provide complete data!" });
    }
    console.log(std, div, date);
    const attendance = await studentsAttendence.findOne({
      std,
      div,
      date
    });
    if (!attendance) {
      return res.status(404).send({ message: "No attendance found!" });
    }

    return res.status(200).send(attendance);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal Server Error!:- " + error });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const attendance = await studentsAttendence.find();
    return res.status(200).send(attendance);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal Server Error!:- " + error });
  }
};
