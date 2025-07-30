const StudentLC = require("../models/StudentLCModel");
const User = require("../models/studentModel");
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

exports.getClassStudents = async (req,res) =>{
  try {
    const {std , div} = req.body;
    console.log(typeof(div))
    if(!std || !div ){
      return res.status(500).send({message: 'Please provide complete info'})
    }
    const students = await User.find({
      "admission.admissionstd": std,
      "admission.admissiondivision": div
    })
    console.log(students.flat())
    console.log(students.length)
    if(students.length <= 0){
      return res.status(404).send({message: "No Students found"})
    }
    return res.status(200).json(students.flat())
  } catch (error) {
    console.log(error)
    return res.status(500).send({message: "Error:"+error})
  }
}