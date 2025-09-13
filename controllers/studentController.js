const StudentLC = require("../models/StudentLCModel");
const User = require("../models/studentModel");
const studentsAttendence = require("../models/studentAttendence")
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
      status: {
        $ne: false
      }
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
    const newLcStudent = await User.findByIdAndUpdate(
       studentid,          //student id
      {
        status: false     //update statement
      },
      {
        new: true
      }
    )
    if(!newLcStudent){
      return res.status(404).send({message: 'No student Found with this idea!'})
    }
   return res.status(200).send({message: 'LC studented updated'})
  } catch (error) {
    console.log(error)
    return res.status(500).send({error: 'Error While adding new lc student: ',error})
  }
};

exports.getLCStudents = async (req, res) => {
  try {
    const lcStudents = await User.find({
      status: false
    })
    if (lcStudents.length === 0) {
      return res.status(200).send({ message: 'No Students.' })
    }
    return res.status(200).send(lcStudents)
  } catch (error) {
    console.log("Error In lC students: ", error)
    return res.status(500).send({ error: error })
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
    const response = await User.find({ "admission.admissionstd": standard, "admission.admissiondivision": division });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//for attendence
exports.addAttendence = async (req, res) => {
  try {
    const { std, div, students } = req.body;

    if (!std || !div || !students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).send({ message: 'Please Provide complete data!' })
    }
    const studentsData = new studentsAttendence({
      std,
      div,
      students
    })
    await studentsData.save()
    return res.status(201).send({ message: "Students Attendence Added!" })
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Internal Server Error!:- ' + error })
  }
}

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id)
    if (!id) {
      return res.status(500).send({ message: 'Please give complete data' })
    }
    const data = await User.findById(id)
    if (!data) {
      return res.status(404).send({ message: 'User not found!' })
    }
    console.log(data)
    return res.status(200).send(data)
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: error })
  }
}